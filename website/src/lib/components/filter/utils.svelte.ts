import { get, writable } from 'svelte/store';
import { map, getStyleManager } from '$lib/components/map/map';

export const filterState = writable<FilterState>({
    open:false,
    distanceMin:null,
    distanceMax:null,
    ascentMin:null,
    ascentMax:null,
    maxAltitude:null,
    estimatedDays:null,

});

type FilterState = {
    open: boolean;

    distanceMin: number | null;
    distanceMax: number | null;

    ascentMin: number | null;
    ascentMax: number | null;

    maxAltitude?: number | null;
    estimatedDays?: number | null;
};

export async function fetchFilteredTracesApi(filters: {
    distanceMin: number | null;
    distanceMax: number | null;
    ascentMin: number | null;
    ascentMax: number | null;
    maxAltitude: number | null;
    estimatedDays: number | null;
}) {
    const res = await fetch('/api/traces/filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
    });

    if (!res.ok) {
        throw new Error('Filter request failed');
    }

    return res.json();
}

export function updateTraceLayer(traces: any[]) {
    const _map = get(map);
    console.log(getStyleManager(),);
    console.log("map:", _map)
    const sm =  getStyleManager();
    if (!sm) return;

    sm.updateTraceLayer(_map, traces);

    }
