import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { kmlToGpx } from './convert';

const TRACES_DIR = path.resolve('savedTraces');

function detectFormat(filename: string) {
    if (filename.endsWith('.kml')) return 'kml';
    if (filename.endsWith('.gpx')) return 'gpx';
    return 'unknown';
}

function extractCoordsFromGpx(gpx: string): number[][] {
    const matches = [...gpx.matchAll(/<trkpt lat="([^"]+)" lon="([^"]+)"/g)];

    return matches.map(m => [
        parseFloat(m[2]), // lon
        parseFloat(m[1])  // lat
    ]);
}

export async function GET() {
    try {
        const files = await fs.readdir(TRACES_DIR);

        const traceFiles = files.filter(f =>
            f.endsWith('.gpx') || f.endsWith('.kml')
        );

        const traces = await Promise.all(
            traceFiles.map(async (file) => {
                const filePath = path.join(TRACES_DIR, file);
                const content = await fs.readFile(filePath, 'utf-8');

                const format = detectFormat(file);

                const gpx = format === 'kml'
                    ? kmlToGpx(content)
                    : content;

                const coordinates = extractCoordsFromGpx(gpx);

                return {
                    name: file.replace(/\.(gpx|kml)$/, ''),
                    file,
                    coordinates // 👈 clé importante
                };
            })
        );

        return json(traces);
    } catch (err) {
        console.error('traces API error:', err);
        return json({ error: 'failed to load traces' }, { status: 500 });
    }
}