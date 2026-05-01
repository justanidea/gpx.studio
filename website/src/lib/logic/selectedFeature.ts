import { writable } from 'svelte/store';

export type SelectedFeature =
    | {
          type: 'refuge';
          data: any;
          details?: any;
          loading: boolean;
      }
    | {
          type: 'bivouac';
          data: any;
          loading: boolean;
      }
    | {
          type: 'map';
          data: null;
          loading: false;
      }
    | null;

export const selectedFeature = writable<SelectedFeature>(null);