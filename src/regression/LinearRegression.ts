import { linear } from "regression";

export function linear_regression(points: number[], qtd: number): number[] {
    let equation = linear(points.map((point, index) => ([index, point])));
    let results = [];
    for (let index = 0; index < qtd; index++) {
        results.push(equation.predict(index + points.length + 1)[1]);
    }
    return results;
}
