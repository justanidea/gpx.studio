import { writable } from 'svelte/store';

type FileState = {
  oldName: string;
  currentName: string;
};

export const fileNamesMap = writable<Record<string, FileState>>({});
