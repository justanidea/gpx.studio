import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseGPX } from '../../../../../gpx/dist/io';
import { kmlToGpx } from '../traces/convert';

const SAVE_DIR = path.join(process.cwd(), 'savedTraces');

function normalizeName(name: string) {
    return String(name || 'trace')
        .toLowerCase()
        .replace(/[\/\\:*?"<>|]/g, '')
        .replace(/[\s_-]+/g, '')
        .normalize('NFKD');
}

function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}

function buildKeys(...names: (string | undefined)[]) {
    return names.filter(isDefined).map(normalizeName);
}

function extractKmlName(xml: string): string | undefined {
    const match =
        xml.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/i) ||
        xml.match(/<name>(.*?)<\/name>/i);

    return match?.[1]?.trim();
}

export async function POST({ request }) {
    const { files } = await request.json();
    if (!Array.isArray(files)) {
        return json({ error: 'Invalid payload' }, { status: 400 });
    }

    await fs.mkdir(SAVE_DIR, { recursive: true });

    const existingFiles = await fs.readdir(SAVE_DIR);

    const existingIndex = await buildExistingIndex(existingFiles);

    const deletions = new Set<string>();

    // 🧠 track files being written in this request (VERY IMPORTANT)
    const writingFiles = new Set<string>();

    const writeOps = files.map(async (file) => {
        const safeName = String(file.name || 'trace')
            .replace(/[\/\\:*?"<>|]/g, '_');

        const gpxFile = parseGPX(file.gpx);
        const kmlName = extractKmlName(file.gpx);

        const keys = buildKeys(
            gpxFile.metadata?.name,
            kmlName,
            safeName
        );

        const targetFile = `${safeName}.gpx`;
        writingFiles.add(targetFile);

        // 🧠 collect candidates for deletion
        for (const key of keys) {
            const existing = existingIndex.get(key);
            if (!existing) continue;

            for (const f of existing) {
                // ❌ NEVER delete file we are about to write
                if (f === targetFile) continue;

                deletions.add(f);
            }
        }

        const gpxPath = path.join(SAVE_DIR, targetFile);

        await fs.writeFile(gpxPath, file.gpx, 'utf-8');
    });

    await Promise.all(writeOps);

    // 🧠 final safety filter BEFORE deleting
    const finalDeletions = Array.from(deletions).filter(f => {
        return !writingFiles.has(f);
    });

    await Promise.all(
        finalDeletions.map((f) =>
            fs.unlink(path.join(SAVE_DIR, f)).catch(() => {})
        )
    );

    return json({ ok: true });
}

function extractGPXName(xml: string): string | undefined {
    const match = xml.match(/<name>(.*?)<\/name>/i);
    return match?.[1]?.trim();
}

async function buildExistingIndex(existingFiles: string[]) {
    const index = new Map<string, string[]>();

    await Promise.all(
        existingFiles.map(async (f) => {
            if (!f.endsWith('.gpx') && !f.endsWith('.kml')) return;

            const fullPath = path.join(SAVE_DIR, f);
            const raw = await fs.readFile(fullPath, 'utf-8');

            let gpxContent = raw;
            let kmlName: string | undefined;

            if (f.endsWith('.kml')) {
                kmlName = extractKmlName(raw);
                gpxContent = kmlToGpx(raw);
            }

            let gpxName: string | undefined;
            try {
                const gpxFile = extractGPXName(gpxContent);
                gpxName = gpxFile.metadata?.name;
            } catch { }

            const keys = buildKeys(
                gpxName,
                kmlName,
                f.replace(/\.(gpx|kml)$/, '')
            );

            for (const key of keys) {
                if (!index.has(key)) index.set(key, []);
                index.get(key)!.push(f);
            }
        })
    );

    return index;
}