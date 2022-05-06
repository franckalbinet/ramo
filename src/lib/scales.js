import { scaleThreshold } from "d3";
import { zip, flatten, last, concat, dropRight } from 'lodash'

export const zoomScale = scaleThreshold()
    .domain([2.5, 3.5, 4.5, 6, 7, 8, 9, 10, 12, 13, 15, 17, 18])
    .range([3, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

export const colorScale = scaleThreshold(
    // [1, 10, 100],
    [0.007, 0.011, 0.014],
    ["#92d050", "#ffff00", "#ffc000", "#ff0000"]);

export function asMapboxStepExpr(scale) {
    return flatten(zip(scale.range(), scale.domain())).filter(
        (d) => d !== undefined
    )
}

export function asColorLegend(scale) {
    let domain = [...scale.domain()];
    let lastValue = last(domain);
    let lowerValues = concat([0], dropRight(domain));
    let labels = zip(lowerValues, domain).map((d) => d.join("-"));
    labels.push(lastValue + "+");
    return zip(labels, scale.range());
}