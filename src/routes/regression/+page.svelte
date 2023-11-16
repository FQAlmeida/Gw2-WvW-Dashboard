<script lang="ts">
    import LinearProgress from "@smui/linear-progress";
    import { onMount } from "svelte";
    import { fetchData, fetching_progress } from "../../stores/CurrentMatchup";
    import {
        model,
        loading_progress,
        transform_to_input,
    } from "../../stores/PredictModel";
    onMount(async () => {
        await fetchData();
    });
    const b = async () => {
        const a = await transform_to_input([
            0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3,
        ]);
        return a;
    };
    const te = b();
</script>

{#if $fetching_progress.done}
    <p>show data</p>
    <!-- {$model.summary()} -->
    {#await te}
        <p>loading</p>
    {:then t}
        {t}
        {$model.predict(t)}   
    {/await}
{:else}
    <LinearProgress
        progress={$fetching_progress.percentage}
        closed={$fetching_progress.done}
    />
    <LinearProgress progress={50.0} closed={$loading_progress.done} />
    {$loading_progress.done}
{/if}
