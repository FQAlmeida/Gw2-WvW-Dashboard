import { writable, derived } from 'svelte/store';

import { DateTime } from "luxon";
import type { ChartData, ChartDataset, Point } from 'chart.js';

export interface WvwEndpointData {
    id: string,
    start_time: DateTime,
    end_time: DateTime,
    scores: { red: number, blue: number, green: number; },
    worlds: { red: number, blue: number, green: number; },
    all_worlds: {
        red: number[],
        blue: number[],
        green: number[],
    },
    deaths: { red: number, blue: number, green: number; },
    kills: { red: number, blue: number, green: number; },
    victory_points: { red: number, blue: number, green: number; },
    skirmishes: Array<{ id: number, scores: { red: number, blue: number, green: number; }; }>;
}

export const api_data = writable<WvwEndpointData[]>([]);

export const matchup_ids = writable<string[]>([]);
export const selected_matchup = writable<string>("2-1");

export const fetching_progress = writable<{ done: boolean, percentage: number; }>({ done: false, percentage: 0 });

export const fetchData = async () => {
    fetching_progress.set({ done: false, percentage: 0 });
    fetch("https://api.guildwars2.com/v2/wvw/matches")
        .then((response) => {
            fetching_progress.set({ done: false, percentage: 25 });
            return response.json();
        })
        .then((data: string[]) => {
            matchup_ids.set(data);
            // selected_matchup.set(data.at(0));
            fetching_progress.set({ done: false, percentage: 50 });
            return fetch(
                `https://api.guildwars2.com/v2/wvw/matches?ids=${data}`
            );
        })
        .then((response) => {
            fetching_progress.set({ done: false, percentage: 75 });
            return response.json();
        })
        .then(
            (
                data: (Omit<WvwEndpointData, "start_time" | "end_time"> & {
                    start_time: string;
                    end_time: string;
                })[]
            ) => {
                api_data.set(
                    data.map((d) => {
                        return {
                            ...d,
                            start_time: DateTime.fromISO(d.start_time),
                            end_time: DateTime.fromISO(d.end_time),
                        };
                    })
                );
                fetching_progress.set({ done: false, percentage: 100 });
            }
        ).then(
            () => {
                setTimeout(() => {
                    fetching_progress.set({ done: true, percentage: 100 });
                }, 500);
            }
        )
        .catch((error) => {
            fetching_progress.set({ done: true, percentage: 0 });
        });
};

export const skirmishes = derived(api_data, ($api_data) => {
    return $api_data.map((matchup) => {
        return {
            id: matchup.id,
            start_time: matchup.start_time,
            end_time: matchup.end_time,
            skirmishes: matchup.skirmishes.sort((skirmish_1, skirmish_2) => {
                return skirmish_1.id - skirmish_2.id;
            }).slice(0, -1)
        };
    });
});

export const skirmish = derived([skirmishes, selected_matchup], ([$skirmishes, $selected_matchup]) => {
    if ($selected_matchup == undefined || $skirmishes == undefined) {
        return undefined;
    }
    return $skirmishes.find(matchup => matchup.id == $selected_matchup);
});

export const skirmish_points = derived(skirmish, ($skirmish) => {
    if ($skirmish == undefined) {
        return undefined;
    }
    return $skirmish.skirmishes.map(skirmish => {
        return skirmish.scores;
    }).reduce<{ red: number[], green: number[], blue: number[], }>((collected_data, current_skirmish) => {
        return {
            red: [...collected_data.red, current_skirmish.red],
            green: [...collected_data.green, current_skirmish.green],
            blue: [...collected_data.blue, current_skirmish.blue]
        };
    }, { red: [], green: [], blue: [] });
});

export const skirmish_summed_points = derived(skirmish_points, ($skirmish_points) => {
    if ($skirmish_points == undefined) {
        return undefined;
    }
    return {
        red: $skirmish_points.red.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        green: $skirmish_points.green.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        blue: $skirmish_points.blue.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0])
    };
});

export const victory_points = derived(skirmish_points, ($skirmish_points) => {
    if ($skirmish_points == undefined) {
        return undefined;
    }
    const zip = (a: number[], b: number[], c: number[]) => a.map((k, i) => [k, b[i], c[i]]);
    const zipped = zip($skirmish_points.red, $skirmish_points.green, $skirmish_points.blue);
    const vp = zipped.map(([red, green, blue]) => {
        const get_vp = (current: number, other_1: number, other_2: number) => {
            if (current >= Math.max(other_1, other_2)) {
                return 5;
            } if (current >= Math.min(other_1, other_2)) {
                return 4;
            }
            return 3;
        };
        const red_vp = get_vp(red, green, blue);
        const green_vp = get_vp(green, red, blue);
        const blue_vp = get_vp(blue, red, green);
        return {
            red: red_vp,
            green: green_vp,
            blue: blue_vp,
        };
    });
    return vp.reduce<{ red: number[], green: number[], blue: number[], }>((prev, current) => {
        return {
            red: [...prev.red, current.red],
            green: [...prev.green, current.green],
            blue: [...prev.blue, current.blue],
        };
    }, { red: [], green: [], blue: [], });
});

export const victory_summed_points = derived(victory_points, ($victory_points) => {
    if ($victory_points == undefined) {
        return undefined;
    }
    return {
        red: $victory_points.red.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        green: $victory_points.green.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        blue: $victory_points.blue.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0])
    };
});


export const all_datetimes = derived(skirmish, ($skirmish) => {
    if ($skirmish == undefined) {
        return undefined;
    }

    let start_time = $skirmish.start_time;
    let end_time = $skirmish.end_time;

    let aux_time = start_time;
    let datetimes: Array<DateTime> = [];

    while (true) {
        aux_time = aux_time.plus({ hours: 2 });
        datetimes = [...datetimes, aux_time];
        if (aux_time > end_time) {
            break;
        }
    }
    return datetimes;
});

export const dataset = derived([skirmish_points, all_datetimes], ([$skirmish_points, $all_datetimes]) => {
    let config: Omit<
        ChartDataset<"bar", (number | [number, number])[]>,
        "borderColor" | "pointBorderColor" | "label" | "data" | "backgroundColor"
    > = {
    };
    let data: ChartData<"bar", (number | [number, number])[], DateTime | number> = {
        labels: $all_datetimes?.slice(0, $skirmish_points?.red.length),
        datasets: [{
            ...config,
            label: "red",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            borderColor: "rgb(255, 0, 0)",
            data: $skirmish_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            data: $skirmish_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            data: $skirmish_points?.blue || [],
        },
        ]
    };
    return data;
});

export const dataset_summed = derived([skirmish_summed_points, all_datetimes], ([$skirmish_summed_points, $all_datetimes]) => {
    let config: Omit<
        ChartDataset<"line", (number | Point)[]>,
        "borderColor" | "pointBorderColor" | "label" | "data" | "backgroundColor"
    > = {
        fill: true,
        borderCapStyle: "round",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "round",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 5,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(0, 0, 0)",
        pointHoverBorderColor: "rgba(220, 220, 220, 1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
    };
    let data: ChartData<"line", (number | Point)[], DateTime | number> = {
        labels: $all_datetimes,
        datasets: [{
            ...config,
            label: "red",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            borderColor: "rgb(255, 0, 0)",
            pointBorderColor: "rgb(255, 0, 0)",
            data: $skirmish_summed_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            pointBorderColor: "rgb(0, 255, 0)",
            data: $skirmish_summed_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            pointBorderColor: "rgb(0, 0, 255)",
            data: $skirmish_summed_points?.blue || [],
        },
        ]
    };
    return data;
});


export const dataset_victory_points = derived([victory_points, all_datetimes], ([$victory_points, $all_datetimes]) => {
    let config: Omit<
        ChartDataset<"bar", (number | [number, number])[]>,
        "borderColor" | "pointBorderColor" | "label" | "data" | "backgroundColor"
    > = {
    };
    let data: ChartData<"bar", (number | [number, number])[], DateTime | number> = {
        labels: $all_datetimes?.slice(0, $victory_points?.red.length),
        datasets: [{
            ...config,
            label: "red",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            borderColor: "rgb(255, 0, 0)",
            data: $victory_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            data: $victory_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            data: $victory_points?.blue || [],
        },
        ]
    };
    return data;
});

export const dataset_summed_victory_points = derived([victory_summed_points, all_datetimes], ([$victory_summed_points, $all_datetimes]) => {
    let config: Omit<
        ChartDataset<"line", (number | Point)[]>,
        "borderColor" | "pointBorderColor" | "label" | "data" | "backgroundColor"
    > = {
        fill: true,
        borderCapStyle: "round",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "round",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 5,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(0, 0, 0)",
        pointHoverBorderColor: "rgba(220, 220, 220, 1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
    };
    let data: ChartData<"line", (number | Point)[], DateTime | number> = {
        labels: $all_datetimes,
        datasets: [{
            ...config,
            label: "red",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            borderColor: "rgb(255, 0, 0)",
            pointBorderColor: "rgb(255, 0, 0)",
            data: $victory_summed_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            pointBorderColor: "rgb(0, 255, 0)",
            data: $victory_summed_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            pointBorderColor: "rgb(0, 0, 255)",
            data: $victory_summed_points?.blue || [],
        },
        ]
    };
    return data;
});
