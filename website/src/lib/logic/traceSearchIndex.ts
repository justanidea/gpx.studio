import { writable } from "svelte/store";

export const traceSearchIndex = writable<
    { name: string; coordinates: number[][]; done: boolean }[]
>([]);