import { writable } from 'svelte/store';

export type BivouacDetails = {
    name: string;
    status: string;
    rule?: string;
    quota?: number;
    reservable?: boolean;
    description?: string;
};

export const selectedBivouac = writable<BivouacDetails | null>(null);