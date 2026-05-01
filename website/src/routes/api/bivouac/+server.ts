import { json } from '@sveltejs/kit';
let cache: any = null;
let cacheTime = 0;
const TTL = 1000 * 60 * 60; // 1h


export async function GET() {
    const now = Date.now();

    if (cache && now - cacheTime < TTL) {
        console.log("Serving bivouac from cache");
        return json(cache, {
            headers: {
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }

    try {
        console.debug("Fetching bivouac from API");
        const response = await fetch(
            'https://reserve-bivouac74.fr/api/map/?map_layer=zonage_bivouac&fields=bivouac&fields=nom&fields=color&fields=fillcolor&fields=capacite&fields=report&fields=reglementation&fields=reservable&fields=quotas'
        );

        if (!response.ok) {
            throw new Error(`API error ${response.status}`);
        }

        const data = await response.json();

        const geojson = {
            type: "FeatureCollection",
            features: data.content
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