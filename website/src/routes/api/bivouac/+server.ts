import { json } from '@sveltejs/kit';

let cache: any = null;
let cacheTime = 0;
const TTL = 1000 * 60 * 60;

function getAllPoints(coords: any): number[][] {
    const points: number[][] = [];

    const walk = (c: any) => {
        if (typeof c[0] === 'number') {
            points.push(c);
        } else {
            for (const sub of c) walk(sub);
        }
    };

    walk(coords);
    return points;
}

function intersectsBBox(feature, bbox) {
    const coords = feature.geometry.coordinates;
    const points = getAllPoints(coords);

    for (const [lng, lat] of points) {
        if (
            lng >= bbox.minX &&
            lng <= bbox.maxX &&
            lat >= bbox.minY &&
            lat <= bbox.maxY
        ) {
            return true;
        }
    }

    return false;
}

const rnnRulesMap: Record<string, any> = {
    RNN112: {
        bivouac: "interdit",
        reglementation: "Règlement spécifique du Haut-Jura"
    },
    RNN045: {
        bivouac: "toléré",
        reglementation: "Autorisé uniquement de 19h à 9h"
    }
};

function enrichFeature(feature) {
    const id = feature.properties?.id_local;

    const rules = rnnRulesMap[id] ?? {
        bivouac: "inconnu",
        reglementation: `${id}: Pas de données, se renseigner !`
    };

    return {
        ...feature,
        properties: {
            ...feature.properties,
            bivouac: "RNN",
            reglementation: rules.reglementation,
        }
    };
}

function featureIntersectsBbox(feature, bbox) {
    const coords = feature.geometry.coordinates;

    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    for (const ring of coords) {
        for (const [lng, lat] of ring) {
            minLng = Math.min(minLng, lng);
            minLat = Math.min(minLat, lat);
            maxLng = Math.max(maxLng, lng);
            maxLat = Math.max(maxLat, lat);
        }
    }

    return !(
        maxLng < bbox.minX ||
        minLng > bbox.maxX ||
        maxLat < bbox.minY ||
        minLat > bbox.maxY
    );
}

const bbox = {
    minX: 6.792297,
    maxX: 6.892548,
    minY: 45.704261,
    maxY: 46.143210
};

export async function GET() {
    const now = Date.now();

    if (cache && now - cacheTime < TTL) {
        return json(cache, {
            headers: {
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }

    try {
        console.debug("Fetching bivouac + nature layers");

        // 1. bivouac
        const bivouacRes = await fetch(
            'https://reserve-bivouac74.fr/api/map/?map_layer=zonage_bivouac&fields=bivouac&fields=nom&fields=color&fields=fillcolor&fields=capacite&fields=report&fields=reglementation&fields=reservable&fields=quotas'
        );

        if (!bivouacRes.ok) throw new Error("Bivouac API error");

        const bivouacData = await bivouacRes.json();

        // 2. IGN RNN (exemple bbox large ou filtrée)
        const rnnRes = await fetch(
            'https://apicarto.ign.fr/api/nature/rnn'
        );
        // console.log(await rnnRes.text());
        // const rnrRes = await fetch(
        //     'https://apicarto.ign.fr/api/nature/rnr'
        // );

        const rnnData = await rnnRes.json();


        const enrichedRNN = rnnData.features
    .filter(f => !intersectsBBox(f, bbox))
    .map(f => {
        const enriched = enrichFeature(f);

        return {
            ...enriched,
            properties: {
                ...enriched.properties,
                bivouac: "RNN: bivouac potentiellement interdit"
            }
        };
    });
        // for (const f of enrichedRNN) {
        //     console.log(f.properties?.name, f.properties?.bivouac);
        // }
        // const rnrData = await rnrRes.json();
        console.debug(`Bivouac: ${bivouacData.content.length} features, RNN: ${rnnData.features.length} features (filtered to ${enrichedRNN.length})`);
        // 3. merge features
        const geojson = {
            type: "FeatureCollection",
            features: [
                ...enrichedRNN,
                ...bivouacData.content,

                // ...(rnrData.features ?? [])
            ]
        };

        cache = geojson;
        cacheTime = now;

        return json(geojson, {
            headers: {
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        console.error(error);
        return json({ error: 'failed' }, { status: 500 });
    }
}