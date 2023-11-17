export async function load_model() {
    // const tf = importSync("@tensorflow/tfjs");
    // const tf = require("@tensorflow/tfjs");
    const { loadLayersModel } = await import("@tensorflow/tfjs");
    let model = await loadLayersModel("ml_models/js/model_0/model.json");
    return model;
}
