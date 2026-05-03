<script lang="ts">
    import { selectedBivouac } from '$lib/logic/bivouac';
    selectedBivouac.subscribe(v => {
    console.log("PANEL STORE UPDATE:", v);
    console.log(selectedBivouac)
});
</script>

{#if $selectedBivouac}
<div class="absolute right-2 top-68 w-86
            bg-background text-foreground
            shadow-xl border border-border
            rounded-l flex flex-col overflow-hidden">

    <!-- HEADER -->
    <div class="p-4 border-b border-border">

        <div class="text-lg font-bold">
            {$selectedBivouac.name}
        </div>

        <div class="mt-2 inline-flex text-xs px-2 py-1 rounded border">
            {$selectedBivouac.status}
        </div>

    </div>

    <!-- CONTENT -->
    <div class="p-4 text-sm space-y-3">

        {#if $selectedBivouac.rule}
            <div>
                <div class="text-xs uppercase text-muted-foreground">
                    Règles
                </div>
                <div class="whitespace-pre-line">
                    {$selectedBivouac.rule}
                </div>
            </div>
        {/if}

        {#if $selectedBivouac.quota}
            <div>
                <div class="text-xs uppercase text-muted-foreground">
                    Quota
                </div>
                <div>
                    {$selectedBivouac.quota}
                </div>
            </div>
        {/if}

        {#if $selectedBivouac.reservable !== undefined}
            <div>
                <div class="text-xs uppercase text-muted-foreground">
                    Réservable
                </div>
                <div>
                    {$selectedBivouac.reservable ? "Oui" : "Non"}
                </div>
            </div>
        {/if}

    </div>

    <!-- FOOTER -->
    <div class="p-3 border-t flex justify-end">
        <button on:click={() => selectedBivouac.set(null)}>
            Fermer
        </button>
    </div>

</div>
{/if}