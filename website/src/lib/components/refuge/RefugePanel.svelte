<script lang="ts">
    import { selectedFeature } from '$lib/logic/selectedFeature';
    import { onMount } from 'svelte';
    import { i18n } from '$lib/i18n.svelte';
    import { getURLForLanguage } from '$lib/utils';
    import Logo from '$lib/components/Logo.svelte';

    let expandedImage = $state(null);
    $effect(() => {
        expandedImage = null;
    });
    onMount(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') expandedImage = null;
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });
    function formatSource(url: string): string {
        try {
            const u = new URL(url);

            // domaine propre
            return u.hostname.replace('www.', '');
        } catch {
            return 'source';
        }
    }
</script>
<a href={getURLForLanguage(i18n.lang, '/')} target="_blank" class="shrink-0">
            <Logo class="h-5 mt-0.5 mx-2 md:hidden" iconOnly={true} width="16" />
            <Logo class="h-5 mt-0.5 mx-2 hidden md:block" width="96" />
        </a>
{#if $selectedFeature}
    <div
        class="absolute right-2 top-68 w-86 h-[calc(100%-23rem)]
            bg-background text-foreground
            shadow-xl border border-border
            rounded-l flex flex-col overflow-hidden"
    >
        <!-- ===================== -->
        <!-- HEADER REFUGE -->
        <!-- ===================== -->
        {#if $selectedFeature.type === 'refuge'}
            <div class="p-4 relative border-b border-border">
                <a
                    class="text-lg font-bold block pr-8"
                    href={$selectedFeature.data.link}
                    target="_blank"
                    rel="noreferrer"
                >
                    {$selectedFeature.data.name}
                </a>

                {#if $selectedFeature.data.icon}
                    <img
                        src={`/icon/${$selectedFeature.data.icon}`}
                        class="w-6 h-6 absolute top-4 right-4"
                        alt="icon"
                    />
                {/if}

                {#if $selectedFeature.data.type}
                    <div
                        class="mt-2 inline-flex items-center text-[12px] px-1.5 py-1
                            bg-muted text-muted-foreground
                            rounded-sm border border-border leading-none"
                    >
                        {$selectedFeature.data.type}
                    </div>
                {/if}

                {#if $selectedFeature.data.altitude}
                    <div
                        class="mt-2 inline-flex items-center text-[12px] px-1.5 py-1
                            bg-muted text-muted-foreground
                            rounded-sm border border-border leading-none"
                    >
                        {$selectedFeature.data.altitude} m
                    </div>
                {/if}

                {#if $selectedFeature.data.places}
                    <div
                        class="mt-2 inline-flex items-center text-[12px] px-1.5 py-1
                            bg-muted text-muted-foreground
                            rounded-sm border border-border leading-none"
                    >
                        {$selectedFeature.data.placesLabel}: {$selectedFeature.data.places}
                    </div>
                {/if}
            </div>
        {/if}

        <!-- ===================== -->
        <!-- HEADER BIVOUAC -->
        <!-- ===================== -->
        {#if $selectedFeature.type === 'bivouac'}
            <div class="p-4 border-b border-border">
                <div class="text-lg font-bold">
                    {$selectedFeature.data.name}
                </div>

                <div class="mt-2 inline-flex text-xs px-2 py-1 rounded border">
                    {i18n._(`bivouac.${$selectedFeature.data.status}`)}
                </div>
            </div>
        {/if}

        {#if $selectedFeature.type === 'natural'}
            <div class="p-4 border-b border-border">
                <div class="text-lg font-bold">
                    {$selectedFeature.data.name}
                </div>

                <div class="flex flex-wrap gap-2 mt-2">
                    {#if $selectedFeature.data.altitude}
                        <span
                            class="inline-flex items-center text-[12px] px-1.5 py-1
                           bg-muted text-muted-foreground
                           rounded-sm border border-border leading-none w-fit"
                        >
                            {$selectedFeature.data.altitude} m
                        </span>
                    {/if}

                    {#if $selectedFeature.data.type}
                        <span
                            class="inline-flex items-center text-[12px] px-1.5 py-1
                           bg-muted text-muted-foreground
                           rounded-sm border border-border leading-none w-fit"
                        >
                            {$selectedFeature.data.type}
                        </span>
                    {/if}
                </div>
            </div>
        {/if}
        <!-- ===================== -->
        <!-- CONTENT -->
        <!-- ===================== -->

        <div class="p-4 text-sm space-y-4 overflow-auto flex-1">
            {#if $selectedFeature.loading}
                <div class="flex items-center gap-2 text-muted-foreground">
                    <div
                        class="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"
                    ></div>
                    Chargement...
                </div>
            {/if}

            <!-- ===================== -->
            <!-- REFUGE DETAILS -->
            <!-- ===================== -->
            {#if $selectedFeature.type === 'refuge' && $selectedFeature.details}
                <!-- PHOTOS -->
                {#if $selectedFeature.details.photos?.length}
                    <div class="space-y-2">
                        <div class="text-xs uppercase text-muted-foreground font-semibold">
                            photos
                        </div>

                        <div class="flex gap-2 overflow-x-auto pb-2">
                            {#each $selectedFeature.details.photos as photo}
                                <a target="_blank" class="shrink-0">
                                    <img
                                        src={photo}
                                        class="h-24 w-32 object-cover rounded border border-border"
                                        on:click={() => (expandedImage = photo)}
                                    />
                                </a>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div class="text-xs text-muted-foreground">Aucune image disponible</div>{/if}

                <!-- SECTIONS -->
                {#if $selectedFeature.details.sections?.length}
                    <div class="space-y-4">
                        {#each $selectedFeature.details.sections as section}
                            <div>
                                <div class="text-xs uppercase text-muted-foreground font-semibold">
                                    {section.key}
                                </div>
                                <div class="whitespace-pre-line">
                                    {section.value}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

                <!-- CONTACT -->
                {#if $selectedFeature.details.contact && $selectedFeature.details.contact !== '-'}
                    <div class="p-3 border border-border rounded">
                        <div class="text-xs uppercase text-muted-foreground font-semibold mb-1">
                            contact
                        </div>
                        <div class="whitespace-pre-line">
                            {$selectedFeature.details.contact}
                        </div>
                    </div>
                {/if}
            {/if}

            <!-- ===================== -->
            <!-- BIVOUAC DETAILS -->
            <!-- ===================== -->
            {#if $selectedFeature.type === 'bivouac'}
                {#if $selectedFeature.data.rule}
                    <div>
                        <div class="text-xs uppercase text-muted-foreground">{i18n._('bivouac.rules')}</div>
                        <div class="whitespace-pre-line">
                            {$selectedFeature.data.rule}
                        </div>
                    </div>
                {/if}

                {#if $selectedFeature.data.quota}
                    <div>
                        <div class="text-xs uppercase text-muted-foreground">Quota</div>
                        <div>
                            {$selectedFeature.data.quota}
                        </div>
                    </div>
                {/if}

                <div>
                    <div class="text-xs uppercase text-muted-foreground">{i18n._('bivouac.bookable')}</div>
                    <div>
                        {$selectedFeature.data.reservable ? i18n._('bivouac.yes') : i18n._('bivouac.no')}
                    </div>
                </div>

                {#if $selectedFeature.data.sources?.length}
                    <div>
                        <div class="text-xs uppercase text-muted-foreground">Sources</div>

                        <div class="flex flex-wrap gap-2 mt-1">
                            {#each $selectedFeature.data.sources as url}
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="px-2 py-1 text-xs rounded-lg border border-border hover:bg-muted transition"
                                >
                                    {formatSource(url)}
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/if}

            {#if $selectedFeature.type === 'natural' && $selectedFeature.details}
                {#if $selectedFeature.type === 'natural' && $selectedFeature.details?.images?.length}
                    <div class="space-y-2">
                        <!-- VERTICAL SCROLL GALLERY -->
                        <div class="flex flex-col h-[calc(100%-23rem)]">
                            {#each $selectedFeature.details.images as img}
                                <a target="_blank" class="block w-full">
                                    <img
                                        src={img}
                                        loading="lazy"
                                        class="w-full h-36 object-cover rounded border border-border hover:opacity-90 transition"
                                        on:click={() => (expandedImage = img)}
                                    />
                                </a>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div class="text-xs text-muted-foreground">Aucune image disponible</div>{/if}
            {/if}
        </div>
        {#if expandedImage}
            <div
                class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                on:click={() => (expandedImage = null)}
            >
                <img
                    src={expandedImage}
                    class="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-xl"
                />
            </div>
        {/if}
        <!-- FOOTER -->
        <div class="p-3 border-t flex justify-end">
            <button
                class="text-sm text-muted-foreground hover:text-foreground"
                on:click={() => selectedFeature.set(null)}
            >
                {i18n._('bivouac.close')}
            </button>
        </div>
    </div>
{/if}
