import fs from 'fs/promises';
import path from 'path';
import { kmlToGpx } from '../../routes/api/traces/convert';
const fileCache = new Map<string, any>();
const fileMtime = new Map<string, number>();

const TRACES_DIR = path.resolve('savedTraces');

type Point = {
    lon: number;
    lat: number;
    ele?: number;
};

type RawPoint = {
    lon: number | null;
    lat: number | null;
    ele: number | null;
};

function cleanPoints(points: Point[]) {
    return points.filter(p =>
        Number.isFinite(p.lon) &&
        Number.isFinite(p.lat) &&
        p.ele != null
    );
}

function verticalDistance(p, a, b) {
    // projection simplifiée + altitude poids fort
    const dx =
        (p.lon - a.lon) / (b.lon - a.lon || 1);

    const dy =
        (p.lat - a.lat) / (b.lat - a.lat || 1);

    const projLat = a.lat + dx * (b.lat - a.lat);
    const projLon = a.lon + dx * (b.lon - a.lon);

    const horizontal =
        Math.sqrt(
            (p.lat - projLat) ** 2 +
            (p.lon - projLon) ** 2
        );

    const elev = p.ele - (a.ele + dx * (b.ele - a.ele));

    // 🔥 altitude heavily weighted
    return Math.sqrt(horizontal ** 2 + (elev / 50) ** 2);
}

function toCleanPoints(points: RawPoint[]): Point[] {
    return points
        .filter((p): p is RawPoint & { lon: number; lat: number } =>
            p.lon != null && p.lat != null
        )
        .map(p => ({
            lon: p.lon,
            lat: p.lat,
            ele: p.ele ?? undefined
        }));
}

function smoothElevation(points: Point[], window = 1) {
    return points.map((_, i, arr) => {
        const slice = arr.slice(
            Math.max(0, i - window),
            Math.min(arr.length, i + window + 1)
        );

        const vals = slice
            .map(p => p.ele!)
            .filter(v => v != null);

        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

        return { ...arr[i], ele: avg };
    });
}

function detectFormat(filename: string) {
    if (filename.endsWith('.kml')) return 'kml';
    if (filename.endsWith('.gpx')) return 'gpx';
    return 'unknown';
}

function extractPoints(gpx: string): Point[] {
    const matches = [...gpx.matchAll(
        /<trkpt[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g
    )];

    return matches.map(m => {
        const lat = parseFloat(m[1]);
        const lon = parseFloat(m[2]);

        const eleMatch = m[3].match(/<ele>\s*([^<\s]+)\s*<\/ele>/);
        const ele = eleMatch ? parseFloat(eleMatch[1]) : undefined;

        return { lon, lat, ele };
    });
}

function extractCoordsFromGpx(gpx: string) {
    const matches = [
        ...gpx.matchAll(
            /<trkpt lat="([^"]+)" lon="([^"]+)">([\s\S]*?)<\/trkpt>/g
        )
    ];

    return matches.map(m => {
        const lat = parseFloat(m[1]);
        const lon = parseFloat(m[2]);

        const eleMatch = m[3].match(/<ele>([^<]+)<\/ele>/);
        const ele = eleMatch ? parseFloat(eleMatch[1]) : null;

        return [lon, lat, ele];
    });
}

function haversine(a, b) {

    const R = 6371;

    const dLat = (b[1] - a[1]) * Math.PI / 180;
    const dLon = (b[0] - a[0]) * Math.PI / 180;

    const lat1 = a[1] * Math.PI / 180;
    const lat2 = b[1] * Math.PI / 180;

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h));

}

function computeDistance(points: Point[]) {
    let d = 0;

    for (let i = 1; i < points.length; i++) {
        d += haversine(
            [points[i - 1].lon, points[i - 1].lat],
            [points[i].lon, points[i].lat]
        );
    }

    return d;
}

function computeMaxAltitude(points: Point[]) {
    return Math.max(...points.map(p => p.ele ?? -Infinity));
}

function smoothElevations(coords: { ele?: number }[], window = 1) {
    return coords.map((_, i, arr) => {
        const slice = arr.slice(
            Math.max(0, i - window),
            Math.min(arr.length, i + window)
        );

        const values = slice
            .map(p => p.ele)
            .filter((v): v is number => v != null);

        const avg =
            values.reduce((a, b) => a + b, 0) / values.length;

        return {
            ...arr[i],
            ele: avg
        };
    });
}

function estimateDays(distanceKm: number, ascent: number, pace = 22) {
    const effortKm = distanceKm + (ascent / 100);
    return Math.ceil(effortKm / pace);
}

function computeDPlus(points: Point[], threshold = 3) {
    let gain = 0;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1].ele;
        const curr = points[i].ele;

        if (prev == null || curr == null) continue;

        const delta = curr - prev;

        // ignore bruit GPS
        if (delta > threshold) {
            gain += delta;
        }
    }

    return Math.round(gain);
}

async function loadFileTrace(file: string) {
    const fullPath = path.join(TRACES_DIR, file);

    const stat = await fs.stat(fullPath);
    const last = fileMtime.get(file);

    if (last && last === stat.mtimeMs) {
        return fileCache.get(file);
    }

    const content = await fs.readFile(fullPath, 'utf-8');

    const format = detectFormat(file);

    const gpx = format === 'kml'
        ? kmlToGpx(content)
        : content;

    const coordinates = extractCoordsFromGpx(gpx);

    type TrackPoint = {
        lon: number;
        lat: number;
        ele?: number;
    };

    const rawPoints = extractCoordsFromGpx(gpx)
    .map(([lon, lat, ele]) => ({ lon, lat, ele }));

    const points = extractPoints(gpx);

    const smoothed = smoothElevation(points, 1);

    const distance = computeDistance(points);
    const maxAltitude = computeMaxAltitude(points);
    console.log("points:", points.length);
    console.log("valid ele:", points.filter(p => p.ele != null).length);
    console.log("sample:", points.slice(0, 10));

    const ascent = computeDPlusStable(points);

    const estimatedDays = estimateDays(distance, ascent);

    const trace = {
        name: file.replace(/\.(gpx|kml)$/, ''),
        file,
        coordinates,
        distance: distance,
        maxAltitude: maxAltitude,
        ascent: ascent,
        estimatedDays: estimatedDays
    };

    console.log(`Loaded trace ${file}: distance=${trace.distance.toFixed(2)}km, ascent=${trace.ascent}m, maxAltitude=${trace.maxAltitude}m, estimatedDays=${trace.estimatedDays}d`);

    fileCache.set(file, trace);
    fileMtime.set(file, stat.mtimeMs);

    return trace;
}

const R = 6371008.8;

function distance(a: Point, b: Point) {
    const rad = Math.PI / 180;

    const lat1 = a.lat * rad;
    const lat2 = b.lat * rad;

    const dLat = lat2 - lat1;
    const dLon = (b.lon - a.lon) * rad;

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(Math.min(h, 1)));
}

export function computeBasicStatistics(points: Point[]) {
    const stats = {
        distance: 0,
        elevationGain: 0,
        elevationLoss: 0,
    };

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        // distance
        stats.distance += distance(prev, curr);

        // elevation naive (pré-D+ GPXStudio)
        if (prev.ele != null && curr.ele != null) {
            const d = curr.ele - prev.ele;

            if (d > 0) stats.elevationGain += d;
            else stats.elevationLoss -= d;
        }
    }

    return stats;
}

function perpendicularDistance(p: Point, a: Point, b: Point) {
    const A = b.lat - a.lat;
    const B = b.lon - a.lon;

    if (A === 0 && B === 0) {
        return Math.sqrt(
            (p.lat - a.lat) ** 2 + (p.lon - a.lon) ** 2
        );
    }

    const t =
        ((p.lat - a.lat) * A + (p.lon - a.lon) * B) /
        (A * A + B * B);

    const clamped = Math.max(0, Math.min(1, t));

    const proj = {
        lat: a.lat + clamped * A,
        lon: a.lon + clamped * B,
    };

    return Math.sqrt(
        (p.lat - proj.lat) ** 2 +
        (p.lon - proj.lon) ** 2
    );
}

function rdp(points, epsilon) {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let index = 0;

    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const d = verticalDistance(points[i], start, end);

        if (d > maxDist) {
            maxDist = d;
            index = i;
        }
    }

    if (maxDist > epsilon) {
        const left = rdp(points.slice(0, index + 1), epsilon);
        const right = rdp(points.slice(index), epsilon);

        return [...left.slice(0, -1), ...right];
    }

    return [start, end];
}

export function computeDPlusStable(points: Point[]) {
  let gain = 0;

    let climbStart = 0;
    let runningGain = 0;

    const EPS = 2;          // bruit vertical
    const MAX_DROP = -5;    // autorise petites descentes
    const MIN_CLIMB = 50;   // seuil final

    let climbing = false;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1].ele;
        const curr = points[i].ele;

        if (prev == null || curr == null) continue;

        const diff = curr - prev;

        if (diff > EPS) {
            if (!climbing) {
                climbing = true;
                climbStart = i - 1;
                runningGain = 0;
            }
            runningGain += diff;
        }

        else if (diff < MAX_DROP) {
            // petite descente tolérée → ne casse pas la montée
            if (climbing) {
                runningGain += diff; // absorbe le bruit
            }
        }

        else {
            // transition réelle
            if (climbing) {
                if (runningGain >= MIN_CLIMB) {
                    gain += runningGain;
                }
                climbing = false;
                runningGain = 0;
            }
        }
    }

    if (climbing && runningGain >= MIN_CLIMB) {
        gain += runningGain;
    }

    return Math.round(gain);
}

export function computeDPlusGPXStudio(points) {
    let gain = 0;

    const WINDOW = 3;

    for (let i = WINDOW; i < points.length - WINDOW; i++) {
        const prev = points[i - WINDOW];
        const curr = points[i + WINDOW];

        if (!prev.ele || !curr.ele) continue;

        const diff = curr.ele - prev.ele;

        if (diff > 2) {
            gain += diff;
        }
    }

    return Math.round(gain);
}

export async function loadTraces() {
    const files = await fs.readdir(TRACES_DIR);

    const traceFiles = files.filter(f =>
        f.endsWith('.gpx') || f.endsWith('.kml')
    );
    return Promise.all(traceFiles.map(loadFileTrace));
}