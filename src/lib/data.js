import { csv } from 'd3';

export async function loadMeasurements() {
    const data = await csv('./data/ConvEx3_CarborneSurvey_Korea.csv', (d) => {
        return {
            date: new Date(d["Date Time"]),
            location: d["Location Name"],
            lat: +d["Latitude"],
            lon: +d["Longitude"],
            dose: +d["Value"],
            doseSv: +d["Value"] / 1e6
        };
    });
    return data;
}

// export async function loadData() {
//     await Promise.all([
//     // fetch("/api/substances", {"credentials": "include"}).then((r) => r.json()),
//     await loadMeasurements().then(d => d)
//   ]);
// }