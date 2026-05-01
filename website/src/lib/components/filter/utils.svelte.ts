import { writable } from 'svelte/store';

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