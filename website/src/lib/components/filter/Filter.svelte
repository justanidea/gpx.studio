<script lang="ts">
    import { Dialog } from 'bits-ui';
    import { Button } from '$lib/components/ui/button';
    import { filterState } from './utils.svelte';
    import { fetchFilteredTracesApi } from './utils.svelte';

    import { get } from 'svelte/store';
    import { getStyleManager, map } from '$lib/components/map/map';

    let open = false;
    let distanceMin: string | number = '';
    let distanceMax: string | number = '';

    let ascentMin: string | number = '';
    let ascentMax: string | number = '';
    let maxAltitude: string | number = '';
    let estimatedDays: string | number = '';

    const unsubscribe = filterState.subscribe((v) => {
        open = v.open;

        distanceMin = v.distanceMin ?? '';
        distanceMax = v.distanceMax ?? '';

        ascentMin = v.ascentMin ?? '';
        ascentMax = v.ascentMax ?? '';
        maxAltitude = v.maxAltitude ?? '';
        estimatedDays = v.estimatedDays ?? '';

    });
    $: $filterState;

    function onOpenChange(v: boolean) {
        console.log('[DIALOG OPEN CHANGE]', v);

        if (v) {
            const s = get(filterState);

            console.log('[STORE ON OPEN]', s);

            distanceMin = s.distanceMin ?? '';
            distanceMax = s.distanceMax ?? '';

            ascentMin = s.ascentMin ?? '';
            ascentMax = s.ascentMax ?? '';
            maxAltitude = s.maxAltitude ?? '';
            estimatedDays = s.estimatedDays ?? '';

            console.log('[LOCAL AFTER SYNC]', {
                distanceMin,
                distanceMax,
                ascentMin,
                ascentMax,
                maxAltitude,
                estimatedDays,

            });
        }
    }

    
    export async function fetchFilteredTraces() {
        const traces = await fetchFilteredTracesApi({
            distanceMin: distanceMin === '' ? null : Number(distanceMin),
            distanceMax: distanceMax === '' ? null : Number(distanceMax),
            ascentMin: ascentMin === '' ? null : Number(ascentMin),
            ascentMax: ascentMax === '' ? null : Number(ascentMax),
            maxAltitude: maxAltitude === '' ? null : Number(maxAltitude),
            estimatedDays: estimatedDays === '' ? null : Number(estimatedDays),
        });

        const map_ = get(map);
        const sm = getStyleManager()
        console.log("map_ and sm:", map_, sm)
        if (!map_ || !sm) return;

        sm.updateTraceLayer(map_, traces);
    }

    async function applyFilters() {
        await fetchFilteredTraces();
        filterState.set({
            open: false,
            distanceMin: distanceMin === '' ? null : Number(distanceMin),
            distanceMax: distanceMax === '' ? null : Number(distanceMax),
            ascentMin: ascentMin === '' ? null : Number(ascentMin),
            ascentMax: ascentMax === '' ? null : Number(ascentMax),
            maxAltitude: maxAltitude === '' ? null : Number(maxAltitude),
            estimatedDays: estimatedDays === '' ? null : Number(estimatedDays),
        });
    }

    async function resetFilters() {
        const res = await fetch('/api/traces');

        const traces = await res.json();

        const map_ = get(map);

        if (map_) {
            const sm = map.styleManager;
            sm?.updateTraceLayer(map_, traces);
        }

        filterState.update((s) => ({
            ...s,
            open: false,
            distanceMin: null,
            distanceMax: null,
            ascentMin: null,
            ascentMax: null,
            maxAltitude: null,
            estimatedDays: null,
        }));
    }
</script>

<Dialog.Root bind:open {onOpenChange}>
    <Dialog.Trigger class="hidden" />

    <Dialog.Portal>
        <Dialog.Content
            class="fixed left-[50%] top-[50%]
translate-x-[-50%]
translate-y-[-50%]
z-50
bg-background
border
rounded-md
shadow-lg
p-4
flex
flex-col
gap-4
w-[420px]"
        >
            <h2 class="text-lg font-semibold">Filter traces</h2>
            <div class="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Distance min km" bind:value={distanceMin} />

                <input
                    type="number"
                    placeholder="Distance max km"
                    bind:value={distanceMax}
                />

                <input type="number" placeholder="D+ min m" bind:value={ascentMin} />

                <input type="number" placeholder="D+ max m" bind:value={ascentMax} />

                <input type="number" placeholder="Max altitude m" bind:value={maxAltitude} />

                <input type="number" placeholder="Estimated days" bind:value={estimatedDays} />
            </div>

            <div class="flex gap-2">
                <Button variant="outline" class="grow" onclick={resetFilters}>Reset</Button>

                <Button class="grow" onclick={applyFilters}>Apply</Button>
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
