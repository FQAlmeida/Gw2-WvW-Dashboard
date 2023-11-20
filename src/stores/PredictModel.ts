import { derived, writable } from "svelte/store";
import { load_model as load_lstm_model } from "./load_model/LoadLSTMModel";
import { browser } from "$app/environment";
import { tensor, type LayersModel, Rank, Tensor } from "@tensorflow/tfjs";
import { all_datetimes, skirmish_points } from "./CurrentMatchup";
import { DateTime } from "luxon";
import type { ChartDataset, ChartData, Point } from "chart.js";
import { linear_regression } from "../regression/LinearRegression";

export const model = writable<LayersModel>(undefined, set => {
    const p = new Promise(async () => await load_model(set));
    Promise.resolve(p);
});
export const loading_progress = writable<{ done: boolean; }>({ done: false });

const load_model = async (set: (value: LayersModel) => void) => {
    loading_progress.set({ done: false });
    if (browser) {
        const m = await load_lstm_model();
        set(m);
    }
    loading_progress.set({ done: true });
};

export const transform_to_input = (values: Array<Array<number>>): Tensor<Rank> => {
    let size = values.length;
    const t = tensor(values).reshape([size, 12, 1]).div(14711.0);
    return t;
};

export const predicted_skirmish_points = derived([skirmish_points, all_datetimes, model], ([$skirmish_points, $all_datetimes, $model]) => {
    if ($skirmish_points == undefined || $all_datetimes == undefined || $skirmish_points.red.length == 0) {
        return undefined;
    }
    const now = DateTime.now();
    if ($skirmish_points.red.length < 13) {
        const red_reg = linear_regression($skirmish_points.red, $all_datetimes.length - $skirmish_points.red.length);
        const green_reg = linear_regression($skirmish_points.green, $all_datetimes.length - $skirmish_points.red.length);
        const blue_reg = linear_regression($skirmish_points.blue, $all_datetimes.length - $skirmish_points.red.length);
        return {
            red: [...$skirmish_points.red, ...red_reg],
            green: [...$skirmish_points.green, ...green_reg],
            blue: [...$skirmish_points.blue, ...blue_reg],
        };
    }

    const predicted_points_red = [...$skirmish_points.red];
    const predicted_points_green = [...$skirmish_points.green];
    const predicted_points_blue = [...$skirmish_points.blue];

    for (let index = predicted_points_red.length; index < $all_datetimes.length; index++) {
        const sk_values = predicted_points_red.slice(index - 13, index - 1);
        const tensor = transform_to_input([sk_values]);
        const pred = $model.predict(tensor);
        if (pred instanceof Array) {
            predicted_points_red.push(Math.round(pred.at(0)?.mul(14711.0).reshape([1]).arraySync().at(0)));
            continue;
        }
        predicted_points_red.push(Math.round(pred.mul(14711.0).reshape([1]).arraySync().at(0)));
    }
    for (let index = predicted_points_green.length; index < $all_datetimes.length; index++) {
        const sk_values = predicted_points_green.slice(index - 13, index - 1);
        const tensor = transform_to_input([sk_values]);
        const pred = $model.predict(tensor);
        if (pred instanceof Array) {
            predicted_points_green.push(Math.round(pred.at(0)?.mul(14711.0).reshape([1]).arraySync().at(0)));
            continue;
        }
        predicted_points_green.push(Math.round(pred.mul(14711.0).reshape([1]).arraySync().at(0)));
    }
    for (let index = predicted_points_blue.length; index < $all_datetimes.length; index++) {
        const sk_values = predicted_points_blue.slice(index - 13, index - 1);
        const tensor = transform_to_input([sk_values]);
        const pred = $model.predict(tensor);
        if (pred instanceof Array) {
            predicted_points_blue.push(Math.round(pred.at(0)?.mul(14711.0).reshape([1]).arraySync().at(0)));
            continue;
        }
        predicted_points_blue.push(Math.round(pred.mul(14711.0).reshape([1]).arraySync().at(0)));
    }

    const d = {
        red: predicted_points_red,
        green: predicted_points_green,
        blue: predicted_points_blue,
    };
    return d;
});
export const predicted_skirmish_summed_points = derived(predicted_skirmish_points, ($predicted_skirmish_points) => {
    if ($predicted_skirmish_points == undefined) {
        return undefined;
    }
    return {
        red: $predicted_skirmish_points.red.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        green: $predicted_skirmish_points.green.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        blue: $predicted_skirmish_points.blue.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0])
    };
});

export const predicted_victory_points = derived(predicted_skirmish_points, ($predicted_skirmish_points) => {
    if ($predicted_skirmish_points == undefined) {
        return undefined;
    }
    const zip = (a: number[], b: number[], c: number[]) => a.map((k, i) => [k, b[i], c[i]]);
    const zipped = zip($predicted_skirmish_points.red, $predicted_skirmish_points.green, $predicted_skirmish_points.blue);
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

export const predicted_victory_summed_points = derived(predicted_victory_points, ($predicted_victory_points) => {
    if ($predicted_victory_points == undefined) {
        return undefined;
    }
    return {
        red: $predicted_victory_points.red.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        green: $predicted_victory_points.green.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0]),
        blue: $predicted_victory_points.blue.reduce((prev, current) => [...prev, (prev.at(-1) || 0) + current], [0])
    };
});

export const predicted_dataset = derived([predicted_skirmish_points, all_datetimes], ([$predicted_skirmish_points, $all_datetimes]) => {
    let config: Omit<
        ChartDataset<"bar", (number | [number, number])[]>,
        "borderColor" | "pointBorderColor" | "label" | "data" | "backgroundColor"
    > = {
    };
    let data: ChartData<"bar", (number | [number, number])[], DateTime | number> = {
        labels: $all_datetimes?.slice(0, $predicted_skirmish_points?.red.length),
        datasets: [{
            ...config,
            label: "red",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            borderColor: "rgb(255, 0, 0)",
            data: $predicted_skirmish_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            data: $predicted_skirmish_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            data: $predicted_skirmish_points?.blue || [],
        },
        ]
    };
    return data;
});

export const predicted_dataset_summed = derived([predicted_skirmish_summed_points, all_datetimes], ([$predicted_skirmish_summed_points, $all_datetimes]) => {
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
            data: $predicted_skirmish_summed_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            pointBorderColor: "rgb(0, 255, 0)",
            data: $predicted_skirmish_summed_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            pointBorderColor: "rgb(0, 0, 255)",
            data: $predicted_skirmish_summed_points?.blue || [],
        },
        ]
    };
    return data;
});

export const dataset_predicted_victory_points = derived([predicted_victory_points, all_datetimes], ([$predicted_victory_points, $all_datetimes]) => {
    let config: Omit<
        ChartDataset<"bar", (number | [number, number])[]>,
        "borderColor" | "pointBorderColor" | "label" | "data" | "backgroundColor"
    > = {
    };
    let data: ChartData<"bar", (number | [number, number])[], DateTime | number> = {
        labels: $all_datetimes?.slice(0, $predicted_victory_points?.red.length),
        datasets: [{
            ...config,
            label: "red",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            borderColor: "rgb(255, 0, 0)",
            data: $predicted_victory_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            data: $predicted_victory_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            data: $predicted_victory_points?.blue || [],
        },
        ]
    };
    return data;
});

export const dataset_predicted_victory_summed_points = derived([predicted_victory_summed_points, all_datetimes], ([$predicted_victory_summed_points, $all_datetimes]) => {
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
            data: $predicted_victory_summed_points?.red || [],
        },
        {
            ...config,
            label: "green",
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderColor: "rgb(0, 255, 0)",
            pointBorderColor: "rgb(0, 255, 0)",
            data: $predicted_victory_summed_points?.green || [],
        },
        {
            ...config,
            label: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgb(0, 0, 255)",
            pointBorderColor: "rgb(0, 0, 255)",
            data: $predicted_victory_summed_points?.blue || [],
        },
        ]
    };
    return data;
});
