import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseGPX } from '../../../../../gpx/dist/io';
import { kmlToGpx } from '../traces/convert';

const SAVE_DIR = path.join(process.cwd(), 'savedTraces');

/* ---------------- NORMALISATION ---------------- */

type FileNameState = {
    oldName: string;
    currentName: string;
};

const fileResults: {
    oldName: string;
    newName: string;
}[] = [];

const decodeHtmlEntities = (str: string) => {
    return str
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
};

function normalizeName(name: string) {
    return decodeHtmlEntities(String(name || 'trace'))
        .toLowerCase()
        .replace(/[\/\\:*?"<>|']/g, '')
        .replace(/[\s_-]+/g, '')
        .replace(/\.(gpx|kml)$/, '')
        .normalize('NFKD');
}

function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}

function buildKeys(...names: (string | undefined)[]) {
    return names.filter(isDefined).map(normalizeName);
}

/* ---------------- EXTRACT ---------------- */

function extractKmlName(xml: string): string | undefined {
    const match =
        xml.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/i) ||
        xml.match(/<name>(.*?)<\/name>/i);

    return match?.[1]?.trim();
}

function extractGPXName(xml: string): string | undefined {
    const match = xml.match(/<name>(.*?)<\/name>/i);
    return match?.[1]?.trim();
}

/* ---------------- API ---------------- */

export async function POST({ request }) {
    const body = (await request.json()) as {
        files: any[];
        fileNamesMap: Record<string, FileNameState>;
    };

    const { files, fileNamesMap } = body;
    let targetFile = '';
    // console.log('Received fileNamesMap:', fileNamesMap);
    if (!Array.isArray(files)) {
        return json({ error: 'Invalid payload' }, { status: 400 });
    }

    await fs.mkdir(SAVE_DIR, { recursive: true });

    const existingFiles = await fs.readdir(SAVE_DIR);
    const existingIndex = await buildExistingIndex(existingFiles);

    const deletions = new Set<string>();
    const writingFiles = new Set<string>();

    /* =========================================================
       🔥 1. BUILD FAST LOOKUP FROM FRONTEND STATE
    ========================================================= */

    const uiMap = new Map<
        string,
        { old: string; current: string }
    >();

    for (const state of Object.values(fileNamesMap || {})) {
        uiMap.set(normalizeName(state.currentName), {
            old: normalizeName(state.oldName),
            current: normalizeName(state.currentName)
        });
    }

    /* =========================================================
       🔥 2. PROCESS FILES
    ========================================================= */

    const writeOps = files.map(async (file) => {
        const safeName = normalizeName(file.name.replace(/\.(gpx|kml)$/, ''));

        const gpxFile = parseGPX(file.gpx);
        const kmlName = extractKmlName(file.gpx);

        /* ---------------- UI CONTEXT ---------------- */

        const uiState = uiMap.get(safeName);

        const uiOldName = uiState?.old;
        const uiCurrentName = uiState?.current;

        /* ---------------- BUILD MATCH KEYS ---------------- */

        const keys = buildKeys(
            gpxFile.metadata?.name,
            kmlName,
            safeName,
            uiOldName,
            uiCurrentName
        );

        // console.log('Processing:', file.name, 'keys:', keys);

        let targetFile = `${safeName}.gpx`;
        // console.log("saving as", targetFile)
        fileResults.push({
            oldName: file.name,
            newName: targetFile
        });
        writingFiles.add(targetFile);

        /* ---------------- DELETE MATCHING FILES ---------------- */

        for (const key of keys) {
            const existing = existingIndex.get(key);
            if (!existing) continue;

            for (const f of existing) {
                const normalizedF = normalizeName(f);

                // ne pas delete ce qu'on réécrit
                if (normalizedF === safeName) continue;

                deletions.add(f);
            }
        }

        /* ---------------- WRITE FILE ---------------- */

        const gpxPath = path.join(SAVE_DIR, targetFile);
        await fs.writeFile(gpxPath, file.gpx, 'utf-8');
    });

    await Promise.all(writeOps);

    /* =========================================================
       🔥 3. FINAL SAFE DELETE
    ========================================================= */

    const finalDeletions = Array.from(deletions).filter(
        f => !writingFiles.has(f)
    );

    // console.log('Deleting files:', finalDeletions);

    await Promise.all(
      finalDeletions.map(f =>
        fs.unlink(path.join(SAVE_DIR, f)).catch(() => {})
      )
    );
    for (const result of fileResults) {
        for (const state of Object.values(fileNamesMap)) {
            // console.log(`Comparing ${state.oldName} with ${result.oldName}`);
            if (normalizeName(state.currentName) === normalizeName(result.oldName)) {
                state.oldName = result.newName;
                // console.log(`Updated fileNamesMap for ${result.oldName}:`, state);
            }
        }
    }
    return json({ ok: true, fileNamesMap: fileNamesMap });
}

/* =========================================================
   INDEX BUILD
========================================================= */

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
                gpxName = extractGPXName(gpxContent);
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