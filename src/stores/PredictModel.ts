import { writable } from "svelte/store";
import { load_model as load_lstm_model, load_tf } from "./load_model/LoadLSTMModel";
import { browser } from "$app/environment";
import type { LayersModel } from "@tensorflow/tfjs";
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

export const transform_to_input = async (values: Array<number>) => {
    if (browser) {
        const tf = await load_tf();
        const tensor = tf.tensor(values).expandDims(0).reshape([12, 1, 1]);
        return tensor;
    }
    return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,]
};
