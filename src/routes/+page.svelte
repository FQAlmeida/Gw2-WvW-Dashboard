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
                        // annotation: {
                        //     annotations: {
                        //         line_red: {
                        //             type: "line",
                        //             yMin: linear_regression(
                        //                 $skirmish_summed_points?.red || [],
                        //                 ($all_datetimes?.length || 0) -
                        //                     ($skirmish_summed_points?.red
                        //                         .length || 0)
                        //             ).at(0),
                        //             yMax: linear_regression(
                        //                 $skirmish_summed_points?.red || [],
                        //                 ($all_datetimes?.length || 0) -
                        //                     ($skirmish_summed_points?.red
                        //                         .length || 0)
                        //             ).at(-1),
                        //             xMin: $all_datetimes?.at(
                        //                 ($skirmish_summed_points?.red.length ||
                        //                     1) - 1
                        //             ),
                        //             xMax: $all_datetimes?.at(-1) || 0,
                        //             borderColor: "rgba(255, 0, 0, 0.3)",
                        //             borderWidth: 2,
                        //         },
                        //         line_green: {
                        //             type: "line",
                        //             yMin: linear_regression(
                        //                 $skirmish_summed_points?.green || [],
                        //                 ($all_datetimes?.length || 0) -
                        //                     ($skirmish_summed_points?.green
                        //                         .length || 0)
                        //             ).at(0),
                        //             yMax: linear_regression(
                        //                 $skirmish_summed_points?.green || [],
                        //                 ($all_datetimes?.length || 0) -
                        //                     ($skirmish_summed_points?.green
                        //                         .length || 0)
                        //             ).at(-1),
                        //             xMin: $all_datetimes?.at(
                        //                 ($skirmish_summed_points?.green.length ||
                        //                     1) - 1
                        //             ),
                        //             xMax: $all_datetimes?.at(-1) || 0,
                        //             borderColor: "rgb(0, 255, 0)",
                        //             borderWidth: 2,
                        //         },
                        //         line_blue: {
                        //             type: "line",
                        //             yMin: linear_regression(
                        //                 $skirmish_summed_points?.blue || [],
                        //                 ($all_datetimes?.length || 0) -
                        //                     ($skirmish_summed_points?.blue
                        //                         .length || 0)
                        //             ).at(0),
                        //             yMax: linear_regression(
                        //                 $skirmish_summed_points?.blue || [],
                        //                 ($all_datetimes?.length || 0) -
                        //                     ($skirmish_summed_points?.blue
                        //                         .length || 0)
                        //             ).at(-1),
                        //             xMin: $all_datetimes?.at(
                        //                 ($skirmish_summed_points?.blue.length ||
                        //                     1) - 1
                        //             ),
                        //             xMax: $all_datetimes?.at(-1) || 0,
                        //             borderColor: "rgb(0, 0, 255)",
                        //             borderWidth: 2,
                        //         },
                        //     },
                        // },
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
