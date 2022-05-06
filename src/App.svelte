<script>
	import Map from "./Map.svelte";
	import MapMarker from "./MapMarker.svelte";
	import ExportBtn from "./ExportBtn.svelte";
	import Legend from "./Legend.svelte";
	import { loadMeasurements } from "./lib/data";
	import { colorScale } from "./lib/scales";

	// async f./lib/datan loadData() {
	// 	const res = await loadMeasurements();
	// 	return res;
	// }

	let promise = loadMeasurements();
	// const data = await loadMeasurements();
	// // loadMeasurements().then(d => console.log(d))

	// const [{ data: measurements } ] = Promise.all([
	//     // fetch("/api/substances", {"credentials": "include"}).then((r) => r.json()),
	//     loadMeasurements()
	// ]);

	// TODO:
	// - Deploy on github: https://javascript.plainenglish.io/svelte-github-pages-english-ff3edd02d48
	// - Fetch: https://dev.to/daveturissini/fetching-data-in-svelte-1jpn

	// const data = csv('./data/ConvEx3_CarborneSurvey_Korea.csv', (d) => {
	//     return {
	//         date: new Date(d["Date Time"]),
	//         location: d["Location Name"],
	//         lat: +d["Latitude"],
	//         lon: +d["Longitude"],
	//         dose: +d["Value"],
	//         doseSv: +d["Value"] / 1e6
	//     };
	// }).then(d => console.log(d))

	// console.log(data)
</script>

{#await promise}
	<p>...Waiting</p>
{:then data}
	<Map lat={24} lon={52.5} zoom={8} {data} {colorScale}>
		<MapMarker lat={24.099442} lon={52.669165} label="NPP" />
		<ExportBtn />
		<Legend title={"Dose Rate (μSv/h)"} scale={colorScale} />
	</Map>
{:catch error}
	<p>Error</p>
{/await}
