import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const SAVE_DIR = path.join(process.cwd(), 'savedTraces');

export async function POST({ request }) {
    const { files } = await request.json();

    console.debug("JSON", files);

    if (!files || !Array.isArray(files)) {
        return json({ error: 'Invalid payload' }, { status: 400 });
    }

    await fs.mkdir(SAVE_DIR, { recursive: true });

    console.debug("SAVE_DIR", SAVE_DIR);

    for (const file of files) {
        const safeName = String(file.name || 'trace')
            .replace(/[^a-z0-9_\-]/gi, '_');

        console.debug("safeName", safeName);

        const gpxPath = path.join(SAVE_DIR, `${safeName}.gpx`);
        const kmlPath = path.join(SAVE_DIR, `${safeName}.kml`);

        console.debug("filename", gpxPath);

        // 🧹 DELETE KML if exists
        try {
            await fs.access(kmlPath);
            await fs.unlink(kmlPath);
            console.debug("Deleted existing KML:", kmlPath);
        } catch {
            // file doesn't exist → ignore
        }

        // 💾 WRITE GPX
        await fs.writeFile(gpxPath, file.gpx, 'utf-8');
    }

    return json({ ok: true });
}