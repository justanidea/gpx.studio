import { json } from '@sveltejs/kit';

import { enrichFeature } from '$lib/bivouac/enrich';
import { adaptIGNFeature } from '$lib/bivouac/adapters';

import rnnData from '$lib/bivouac/storedData/rnn.json';
import pnData from '$lib/bivouac/storedData/pn.json';
import pnrData from '$lib/bivouac/storedData/pnr.json';
import rbData from '$lib/bivouac/storedData/rb.json';
import rncfData from '$lib/bivouac/storedData/rncf.json';
import { rulesMap } from '$lib/bivouac/rules';

let cache = null;
let cacheTime = 0;
const TTL = 1000 * 60 * 60;

function process(data, type) {
    console.log("Type is:", type, "with", data.length, "features");
    return data
        .map(f => adaptIGNFeature(f, type))
        .map(f => enrichFeature(f));
}

function matchBivouacRule(feature: any): string {
    switch (feature.properties?.bivouac) {
        case "Toléré":
            return "allowed";
        case "Déconseillé":
            return "restricted";
        case "Interdit":
            return "forbidden";
        default:
            return feature.properties?.bivouac ?? "unknown";
    }
}   

export async function GET() {
    const now = Date.now();

    if (cache && now - cacheTime < TTL) {
        return json(cache);
    }

    // =========================
    // STATIC DATASETS
    // =========================
    const rnnFeatures = process(rnnData, "RNN");
    const pnFeatures = process(pnData, "PN");
    const pnrFeatures = process(pnrData, "PNR");
    const rbFeatures = process(rbData, "RB");
    const rncfFeatures = process(rncfData, "RNCF");

    const f = pnFeatures[7];
    // =========================
    // DYNAMIC BIVOUAC (only external)
    // =========================
    const bivRes = await fetch(
        'https://reserve-bivouac74.fr/api/map/?map_layer=zonage_bivouac&fields=bivouac&fields=nom&fields=color&fields=fillcolor&fields=capacite&fields=report&fields=reglementation&fields=reservable&fields=quotas'
    );

    const bivData = await bivRes.json();
    for (const feature of bivData.content) {
        feature.properties.bivouac = matchBivouacRule(feature);
    }
    const geojson = {
        type: "FeatureCollection",
        features: [
            ...pnFeatures,
            ...pnrFeatures,
            ...rnnFeatures,
            ...rncfFeatures,
            ...rbFeatures,
            ...bivData.content
        ]
    };

    cache = geojson;
    cacheTime = now;

    return json(geojson);
}