import { DOMParser } from '@xmldom/xmldom';
import { kml } from '@tmcw/togeojson';

export function kmlToGpx(xmlText: string): string {
    const clean = xmlText.replace(/^\uFEFF/, '').trim();

    const parser = new DOMParser();
    const xml = parser.parseFromString(clean, 'text/xml');

    const geojson: any = kml(xml);

    if (!geojson?.features?.length) {
        return emptyGpx();
    }

    const coords: string[] = [];

    for (const feature of geojson.features) {
        const geom = feature?.geometry;
        if (!geom) continue;

        const extracted = extractCoords(geom);

        for (const [lon, lat, ele] of extracted) {
            coords.push(`
<trkpt lat="${lat}" lon="${lon}">
    ${ele ? `<ele>${ele}</ele>` : ''}
</trkpt>`);
        }
    }

    return buildGpx(coords);
}

export function kmlToGeoJSON(xmlText: string) {
    const clean = xmlText.replace(/^\uFEFF/, '').trim();

    const parser = new DOMParser();
    const xml = parser.parseFromString(clean, 'text/xml');

    return kml(xml);
}

function extractCoords(geom: any): number[][] {
    if (!geom) return [];

    if (geom.type === 'LineString') return geom.coordinates;

    if (geom.type === 'MultiLineString') {
        return geom.coordinates.flat();
    }

    if (geom.type === 'GeometryCollection') {
        return geom.geometries.flatMap(extractCoords);
    }

    return [];
}

function buildGpx(coords: string[]) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="gpx.studio">
<trk>
<trkseg>
${coords.join('\n')}
</trkseg>
</trk>
</gpx>`;
}

function emptyGpx() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="gpx.studio">
<trk><trkseg></trkseg></trk>
</gpx>`;
}