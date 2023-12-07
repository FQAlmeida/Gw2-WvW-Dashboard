<script lang="ts">
    import LinearProgress from "@smui/linear-progress";
    import { onMount } from "svelte";
    import { fetchData, fetching_progress } from "../../stores/CurrentMatchup";
    import {
        loading_progress,
        predicted_dataset,
        predicted_skirmish_points,
        dataset_predicted_victory_points,
        dataset_predicted_victory_summed_points,
        predicted_dataset_summed,
    } from "../../stores/PredictModel";
    import AnnotationPlugin from "chartjs-plugin-annotation";
    import {
        CategoryScale,
        Chart as ChartJS,
        Title as ChartJSTitle,
        Legend,
        LineElement,
        BarElement,
        LinearScale,
        PointElement,
        TimeScale,
        Tooltip,
    } from "chart.js";
    import "chartjs-adapter-luxon";
    import LayoutGrid, { Cell } from "@smui/layout-grid";
    import { Bar, Line } from "svelte-chartjs";

    ChartJS.register(
        ChartJSTitle,
        Tooltip,
        Legend,
        AnnotationPlugin,
        LineElement,
        BarElement,
        LinearScale,
        PointElement,
        CategoryScale,
        TimeScale,
    );

    onMount(async () => {
        await fetchData();
    });
</script>

{#if $fetching_progress.done}
    {#await $predicted_skirmish_points then result}
        <LayoutGrid>
            <Cell span={6}>
                <div class="mdc-typography--headline5">Skirmishes Scores</div>
                <Bar
                    data={$predicted_dataset}
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                type: "time",
                                stacked: true,
                            },
                            y: {
                                stacked: true,
                            },
                        },
                    }}
                />
            </Cell>
            <Cell span={6}>
                <div class="mdc-typography--headline5">
                    Summed Skirmishes Scores
                </div>
                <Line
                    data={$predicted_dataset_summed}
                    options={{
                        plugins: {},
                        responsive: true,
                        scales: {
                            x: {
                                type: "time",
                            },
                            y: {
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            </Cell><Cell span={6}>
                <div class="mdc-typography--headline5">Victory Points</div>
                <Bar
                    data={$dataset_predicted_victory_points}
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                type: "time",
                                stacked: true,
                            },
                            y: {
                                stacked: true,
                            },
                        },
                    }}
                />
            </Cell>
            <Cell span={6}>
                <div class="mdc-typography--headline5">
                    Summed Victory Points
                </div>
                <Line
                    data={$dataset_predicted_victory_summed_points}
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                type: "time",
                            },
                            y: {
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            </Cell>
        </LayoutGrid>
    {/await}
{:else}
    <LinearProgress
        progress={$fetching_progress.percentage}
        closed={$fetching_progress.done}
    />
    <LinearProgress progress={50.0} closed={$loading_progress.done} />
    {$loading_progress.done}
{/if}
