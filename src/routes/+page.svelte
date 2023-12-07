<script lang="ts">
    import LinearProgress from "@smui/linear-progress";
    import { onMount } from "svelte";
    import { Line, Bar } from "svelte-chartjs";
    import {
        dataset,
        dataset_summed,
        dataset_victory_points,
        dataset_summed_victory_points,
        fetchData,
        fetching_progress,
    } from "../stores/CurrentMatchup";
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
        TimeScale
    );

    onMount(async () => {
        await fetchData();
    });
</script>

{#if $fetching_progress.done}
    <LayoutGrid>
        <Cell span={6}>
            <div class="mdc-typography--headline5">Skirmishes Scores</div>
            <Bar
                data={$dataset}
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
                data={$dataset_summed}
                options={{
                    plugins: {
                    },
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
        <Cell span={6}>
            <div class="mdc-typography--headline5">Victory Points</div>
            <Bar
                data={$dataset_victory_points}
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
            <div class="mdc-typography--headline5">Summed Victory Points</div>
            <Line
                data={$dataset_summed_victory_points}
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
{:else}
    <LinearProgress
        progress={$fetching_progress.percentage}
        closed={$fetching_progress.done}
    />
{/if}
