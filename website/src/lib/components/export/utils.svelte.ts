import { selection } from '$lib/logic/selection';
import { fileStateCollection } from '$lib/logic/file-state';
import { settings } from '$lib/logic/settings';
import { buildGPX, type GPXFile } from 'gpx';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { get } from 'svelte/store';
import { derived, writable } from 'svelte/store';
import { map } from '../map/map';
import { fileNamesMap } from '$lib/logic/fileNames';
import maplibregl from 'maplibre-gl';
import { fetchFilteredTracesApi, updateTraceLayer } from '../filter/utils.svelte';

export const exportOptions = writable({
    time: true,
    hr: true,
    cad: true,
    atemp: true,
    power: true,
    extensions: false,
});

export const exclude = derived(exportOptions, ($opt) =>
    Object.keys($opt).filter((key) => !$opt[key])
);

const gpxCache = new Map<string, string>();

export enum ExportState {
    NONE,
    SELECTION,
    ALL,
}
export const exportState = $state({
    current: ExportState.NONE,
});

async function exportFiles(fileIds: string[], exclude: string[]) {
    if (fileIds.length > 1) {
        await exportFilesAsZip(fileIds, exclude);
    } else {
        const firstFileId = fileIds.at(0);
        if (firstFileId != null) {
            const file = fileStateCollection.getFile(firstFileId);
            if (file) {
                exportFile(file, exclude);
            }
        }
    }
}

export async function exportSelectedFiles(exclude: string[]) {
    const fileIds: string[] = [];
    selection.applyToOrderedSelectedItemsFromFile(async (fileId, level, items) => {
        fileIds.push(fileId);
    });
    await exportFiles(fileIds, exclude);
}

export async function exportAllFiles(exclude: string[]) {
    await exportFiles(get(settings.fileOrder), exclude);
}


export async function saveSelectedFiles(exclude: string[]) {
    const fileIds: string[] = [];

    selection.applyToOrderedSelectedItemsFromFile((fileId) => {
        fileIds.push(fileId);
    });

    await saveFiles(fileIds, exclude);
}

export async function saveAllFiles(exclude: string[]) {
    const fileIds = get(settings.fileOrder);
    await saveFiles(fileIds, exclude);
}

function exportFile(file: GPXFile, exclude: string[]) {
    const blob = new Blob([buildGPX(file, exclude)], { type: 'application/gpx+xml' });
    FileSaver.saveAs(blob, `${file.metadata.name}.gpx`);
}

async function exportFilesAsZip(fileIds: string[], exclude: string[]) {
    const zip = new JSZip();
    for (const fileId of fileIds) {
        const file = fileStateCollection.getFile(fileId);
        if (file) {
            const gpx = buildGPX(file, exclude);
            let filename = file.metadata.name;
            for (let i = 1; zip.files[filename + '.gpx']; i++) {
                filename = file.metadata.name + `-${i}`;
            }
            zip.file(filename + '.gpx', gpx);
        }
    }
    if (Object.keys(zip.files).length > 0) {
        const blob = await zip.generateAsync({ type: 'blob' });
        FileSaver.saveAs(blob, 'gpx-files.zip');
    }
}

function markAsDone(file: GPXFile) {
    if (!file.extensions) {
        file.extensions = {};
    }
    if (file.extensions.done === true) {
        file.extensions.done = false;
    } else {
        file.extensions.done = true;
    }
}

function resolveFiles(fileIds: string[]) {
    const files: GPXFile[] = [];

    for (const id of fileIds) {
        const file = fileStateCollection.getFile(id);
        if (file) files.push(file);
    }

    return files;
}

function normalizeName(name: string) {
    return String(name || 'trace')
        .toLowerCase()
        .replace(/[\/\\:*?"<>|]/g, '')   // enlève caractères invalides
        .replace(/[\s_-]+/g, '')        // enlève espaces, _ et -
        .normalize('NFKD');             // normalisation unicode
}


function toggleDoneInSourceBatch(
    data: GeoJSON.FeatureCollection,
    fileNames: string[]
): GeoJSON.FeatureCollection {
    const nameSet = new Set(fileNames.map(normalizeName));

    let changed = false;

    const features = data.features.map((f: any) => {
        const props = f.properties ?? {};

        if (!nameSet.has(normalizeName(props.name))) {
            return f;
        }

        changed = true;
        return {
            ...f,
            properties: {
                ...props,
                done: !props.done,
            },
        };
    });

    return changed ? { ...data, features } : data;
}
export async function saveSelectedFilesAsDone(exclude: string[]) {

    const fileIds: string[] = [];
    selection.applyToOrderedSelectedItemsFromFile((fileId) => {
        fileIds.push(fileId);
    });

    const source = map.instance?.getSource("traces") as maplibregl.GeoJSONSource;
    if (!source) return;
    const data = source.serialize().data;
    const fileNames: string[] = [];
    for (const fileId of fileIds) {
        const file = fileStateCollection.getFile(fileId);
        if (!file) continue;

        markAsDone(file);
        fileNames.push(file.metadata.name || "");
    }
    const updated = toggleDoneInSourceBatch(data, fileNames);

    if (updated !== data) {
        source.setData(updated);
    }
    await saveFiles(fileIds, exclude);
}

export async function saveAllFilesAsDone(exclude: string[]) {
    const fileIds: string[] = [];

    const ordered = get(settings.fileOrder);

    for (const fileId of ordered) {
        fileIds.push(fileId);
    }
    
    for (const fileId of fileIds) {
        const file = fileStateCollection.getFile(fileId);
        if (!file) continue;

        markAsDone(file);
    }

    await saveFiles(fileIds, exclude);
}

async function saveFiles(fileIds: string[], exclude: string[]) {
    const files = resolveFiles(fileIds);

    const filesPayload = files.map(file => ({
        name: file.metadata.name || "trace",
        gpx: buildGPX(file, exclude)
    }));
    try {
        const fileNamesMapInstance = get(fileNamesMap)
    const res =  await fetch('/api/save-trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesPayload, fileNamesMap: fileNamesMapInstance })
    });
    const data = await res.json();
    fileNamesMap.set(data.fileNamesMap);
    console.log("Files saved successfully:", data);
    } catch (error) {
        console.log("Error saving files:", error);
    }

    
    const traces = await fetchFilteredTracesApi({})
    await updateTraceLayer(traces);
}

function buildCachedGPX(file: GPXFile, exclude: string[]) {
    const key = JSON.stringify({
        id: file._data.id,
        done: file.extensions?.done,
        exclude
    });

    if (gpxCache.has(key)) {
        return gpxCache.get(key)!;
    }

    const gpx = buildGPX(file, exclude);
    gpxCache.set(key, gpx);

    return gpx;
}
