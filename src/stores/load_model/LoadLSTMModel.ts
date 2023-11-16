import { browser } from "$app/environment";

async function load_model() {
    const tf = await import("@tensorflow/tfjs");
    let model = await tf.loadLayersModel("ml_models/js/model.json");
    return model;
}
export const load_tf = async () => {
    if (browser) {
        return await import("@tensorflow/tfjs");
    } else {
        return await import("@tensorflow/tfjs");
    }
};
export { load_model };
