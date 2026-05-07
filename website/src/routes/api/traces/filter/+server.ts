import { json } from '@sveltejs/kit';
import { loadTraces } from '$lib/server/traces';

export async function POST({ request }) {

    const f = await request.json();

const filters = {
    distanceMin: f.distanceMin != null ? Number(f.distanceMin) : null,
    distanceMax: f.distanceMax != null ? Number(f.distanceMax) : null,
    ascentMin: f.ascentMin != null ? Number(f.ascentMin) : null,
    ascentMax: f.ascentMax != null ? Number(f.ascentMax) : null,
    maxAltitude: f.maxAltitude != null ? Number(f.maxAltitude) : null,
    estimatedDays: f.estimatedDays != null ? Number(f.estimatedDays) : null,
};
    console.log('[FILTER]', filters);
    let traces =
        await loadTraces();
    traces = traces.filter(t => {

    if (filters.distanceMin != null && t.distance < filters.distanceMin)
        return false;

    if (filters.distanceMax != null && t.distance > filters.distanceMax)
        return false;

    if (filters.ascentMin != null && t.ascent < filters.ascentMin)
        return false;

    if (filters.ascentMax != null && t.ascent > filters.ascentMax)
        return false;

    if (filters.maxAltitude != null && t.maxAltitude != null && t.maxAltitude > filters.maxAltitude)
        return false;

    if (filters.estimatedDays != null && t.estimatedDays != null && t.estimatedDays !== filters.estimatedDays)
        return false;

    return true;

});
    console.log("returning", traces.length, "traces.")
    return json(traces);

}