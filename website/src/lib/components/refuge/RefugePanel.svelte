<script lang="ts">
import { selectedRefuge, refugeLoading } from '$lib/logic/refuge';
</script>

{#if $selectedRefuge}
<div class="absolute right-2 top-68 w-86 h-[calc(100%-23rem)]
            bg-background text-foreground
            shadow-xl border border-border
            rounded-l flex flex-col overflow-hidden">

    <!-- HEADER -->
    <div class="p-4 relative border-b border-border">

        <a class="text-lg font-bold block pr-8"
           href={$selectedRefuge.link}
           target="_blank"
           rel="noreferrer">

            {$selectedRefuge.name}
        </a>

        {#if $selectedRefuge.icon}
            <img
                src={`/icon/${$selectedRefuge.icon}`}
                class="w-6 h-6 absolute top-4 right-4"
                alt="icon"
            />
        {/if}

        {#if $selectedRefuge.type}
            <div class="mt-2 inline-flex items-center text-[12px] px-1.5 py-1
                        bg-muted text-muted-foreground
                        rounded-sm border border-border leading-none">
                {$selectedRefuge.type}
            </div>
        {/if}

        {#if $selectedRefuge.altitude}
            <div class="mt-2 inline-flex items-center text-[12px] px-1.5 py-1
                        bg-muted text-muted-foreground
                        rounded-sm border border-border leading-none">
                {$selectedRefuge.altitude} m
            </div>
        {/if}

        {#if $selectedRefuge.places}
            <div class="mt-2 inline-flex items-center text-[12px] px-1.5 py-1
                        bg-muted text-muted-foreground
                        rounded-sm border border-border leading-none">
                {$selectedRefuge.placesLabel}: {$selectedRefuge.places}
            </div>
        {/if}
    </div>

    <!-- CONTENT -->
    {#if $selectedRefuge.details}
    <div class="p-4 flex-1 overflow-auto text-sm space-y-6">
        
        {#if $refugeLoading}
            <div class="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div class="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                Chargement des détails...
            </div>
        {/if}
        <!-- PHOTOS -->
        {#if $selectedRefuge.details.photos?.length}
            <div class="space-y-2">

                <div class="text-[11px] uppercase text-muted-foreground font-semibold">
                    photos
                </div>

                <div class="flex gap-2 overflow-x-auto pb-2">

                    {#each $selectedRefuge.details.photos as photo}
                        <a href={photo} target="_blank" class="shrink-0">
                            <img
                                src={photo}
                                alt="photo refuge"
                                class="h-24 w-32 object-cover rounded border border-border
                                       hover:scale-[1.03] transition-transform"
                            />
                        </a>
                    {/each}

                </div>

            </div>
        {/if}
        <!-- SECTIONS -->
        {#if $selectedRefuge.details.sections?.length}
            <div class="space-y-4">

                {#each $selectedRefuge.details.sections as section}
                    <div class="space-y-1">

                        <div class="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                            {section.key}
                        </div>

                        <div class="whitespace-pre-line leading-relaxed">
                            {section.value}
                        </div>

                    </div>
                {/each}

            </div>
        {/if}

        <!-- CONTACT -->
        {#if $selectedRefuge.details.contact && $selectedRefuge.details.contact !== "-"}
            <div class="p-3 rounded border border-border">

                <div class="text-[11px] uppercase text-muted-foreground font-semibold mb-1">
                    contact
                </div>

                <div class="whitespace-pre-line text-sm">
                    {$selectedRefuge.details.contact}
                </div>

            </div>
        {/if}

        

    </div>
    {/if}

    <!-- FOOTER -->
    <div class="p-3 border-t border-border flex justify-end">
        <button
            class="text-sm text-muted-foreground hover:text-foreground"
            on:click={() => selectedRefuge.set(null)}
        >
            Fermer
        </button>
    </div>

</div>
{/if}