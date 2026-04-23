import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { kmlToGpx } from '../convert';

const TRACES_DIR = path.resolve('savedTraces');

export async function GET({ params }) {
    try {
        const name = params.name;

        const gpxPath = path.join(TRACES_DIR, `${name}.gpx`);
        const kmlPath = path.join(TRACES_DIR, `${name}.kml`);

        let filePath = gpxPath;

        try {
            await fs.access(filePath);
        } catch {
            filePath = kmlPath;
        }

        const content = await fs.readFile(filePath, 'utf-8');

        const isKml = content.trimStart().includes('<kml');

        const gpx = isKml
            ? kmlToGpx(content)
            : content;

        return json({
            name,
            gpx
        });

    } catch (err) {
        console.error('trace fetch error:', err);
        return json({ error: 'trace not found' }, { status: 404 });
    }
}

function detectFormat(filename: string, content?: string): 'gpx' | 'kml' | 'unknown' {
    const lower = filename.toLowerCase();

    // 1. Priorité à l'extension
    if (lower.endsWith('.gpx')) return 'gpx';
    if (lower.endsWith('.kml')) return 'kml';

    // 2. Fallback si extension absente ou trompeuse
    if (content) {
        const trimmed = content.trimStart();

        if (trimmed.startsWith('<?xml') && trimmed.includes('<gpx')) {
            return 'gpx';
        }

        if (trimmed.includes('<kml')) {
            return 'kml';
        }
    }

    return 'unknown';
}
