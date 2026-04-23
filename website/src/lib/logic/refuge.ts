import { writable } from 'svelte/store';

export const refugeLoading = writable(false);
export type RefugeDetails = {
    sections: {
        key: string;
        value: string;
    }[];
    contact: string | null;
    photos: string[];
};

export const selectedRefuge = writable<RefugeDetails | null>(null);