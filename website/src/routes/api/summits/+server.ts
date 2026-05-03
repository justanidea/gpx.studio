import { json } from '@sveltejs/kit';

export async function GET({ url }) {

    const bbox = url.searchParams.get('bbox');
    // console.debug("overpass request", bbox)
    if (!bbox) {
        return json(
            { error: 'bbox required' },
            { status: 400 }
        );
    }

    // expected:
    // west,south,east,north
    const [west, south, east, north] =
        bbox.split(',').map(Number);

    if (
        [west, south, east, north]
            .some(v => Number.isNaN(v))
    ) {
        return json(
            { error: 'invalid bbox' },
            { status: 400 }
        );
    }

    // OSM Overpass query
    const query = `[out:json][timeout:25];

(
  // LACS / EAUX (inclut gros lacs via relations)
  way["natural"="water"](${south},${west},${north},${east});
  relation["natural"="water"](${south},${west},${north},${east});

  // SOMMETS
  node["natural"="peak"]["name"](${south},${west},${north},${east});
);

out center tags;`;
    try {

        const response = await fetch(
            'https://overpass-api.de/api/interpreter',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'gpx-studio-fork/1.0 (contact: dev)'

                },
                body: new URLSearchParams({
                    data: query
                })
            }
        );
        // console.debug("response", response.status)
        const body = new URLSearchParams({ data: query });


        if (!response.ok) {
            throw new Error(
                `Overpass error ${response.status}`
            );
        }
        const data = await response.json();
        const geojson = {
            type: 'FeatureCollection',
            features: data.elements
                .map((el: any) => {
                    const lat = el.lat ?? el.center?.lat;
                    const lon = el.lon ?? el.center?.lon;

                    if (lat == null || lon == null) return null;

                    const isPeak = el.tags?.natural === 'peak';

                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [lon, lat]
                        },
                        properties: {
                            nom:
                                el.tags?.name
                                    ? `${el.tags.name}${isPeak ? '\n' + (el.tags?.ele ?? '') + 'm' : ''}`
                                    : '',

                            ele: el.tags?.ele ?? null,

                            natural: el.tags?.natural ?? el.tags?.water ?? null
                        }
                    };
                })
                .filter(Boolean)
        };

        return json(geojson);

    }
    catch (err) {

        console.error(
            'Summits API error:',
            err
        );

        return json(
            {
                type: 'FeatureCollection',
                features: []
            },
            { status: 500 }
        );
    }
}