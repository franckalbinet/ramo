<script>
    import { onDestroy, setContext } from "svelte";
    import { mapbox, key } from "./lib/mapbox";
    import print from "print-js";
    import { zoomScale, asMapboxStepExpr } from "./lib/scales";
    import { extent } from "d3";
    // import { centroid, polygon } from "@turf/turf";
    // import { centroid as test } from "@turf/centroid";
    // import { centroid } from "geojson2h3";
    import * as turf from "@turf/turf";
    import {
        bboxToPoly,
        getHexagons,
        toCentroids,
    } from "./lib/geoprocessing.js";

    setContext(key, {
        getMap: () => map,
    });

    export let lat;
    export let lon;
    export let zoom;
    export let data;
    export let colorScale;
    export let projection = "naturalEarth";

    let container;
    let map;
    let hoveredHexId = null;

    function getDataBbox(data) {
        let [minLat, maxLat] = extent(data, (d) => d.lat);
        let [minLon, maxLon] = extent(data, (d) => d.lon);
        const southWest = new mapbox.LngLat(minLon, minLat);
        const northEast = new mapbox.LngLat(maxLon, maxLat);
        return new mapbox.LngLatBounds(southWest, northEast);
    }

    const colors = asMapboxStepExpr(colorScale);

    function load() {
        map = new mapbox.Map({
            container,
            style: "mapbox://styles/franckalbinet/cir54goks0016cinp0q0x5h8r",
            center: [lon, lat],
            zoom,
            attributionControl: false,
            projection: projection,
            // pitch: 45,
        });

        // Create a popup, but don't add it to the map yet.
        const popup = new mapbox.Popup({
            closeButton: false,
            closeOnClick: false,
        });

        let hexbins = getHexagons(
            data,
            zoomScale(map.getZoom()),
            bboxToPoly(map.getBounds())
        );
        console.log("Hexagons: ", hexbins);
        // console.log("Hexagons centroid: ", toCentroids(hexbins));
        map.fitBounds(getDataBbox(data), { padding: 100 });

        map.addControl(new mapbox.NavigationControl(), "top-right");

        const scale = new mapbox.ScaleControl({
            maxWidth: 150,
            unit: "km",
        });
        map.addControl(scale);

        // map.addControl(new mapbox.Minimap(optionsMiniMap), "bottom-right");

        map.on("load", () => {
            map.addSource("hexbins", {
                type: "geojson",
                data: getHexagons(
                    data,
                    zoomScale(map.getZoom()),
                    bboxToPoly(map.getBounds())
                ),
                // promoteId: "id",
                generateId: true,
            });

            map.addSource("hexbins-centroid", {
                type: "geojson",
                data: toCentroids(
                    getHexagons(
                        data,
                        zoomScale(map.getZoom()),
                        bboxToPoly(map.getBounds())
                    )
                ),
            });

            // Hexbins fill
            map.addLayer({
                id: "hexbins-fill",
                type: "fill",
                source: "hexbins",
                layout: {},
                paint: {
                    "fill-color": [
                        "step",
                        ["get", "max", ["get", "value"]],
                        ...colors,
                    ],
                    "fill-opacity": 0.8,
                    // "fill-outline-color": "#555",
                },
            });

            map.addLayer({
                id: "hexbins-line",
                type: "line",
                source: "hexbins",
                layout: {},
                paint: {
                    "line-color": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        "#888",
                        "#bbb",
                    ],
                    "line-opacity": 1,
                    "line-width": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        4,
                        1,
                    ],
                },
            });

            // Hexbins extrusion layer
            // map.addLayer({
            //     id: "hexbins-extrude",
            //     type: "fill-extrusion",
            //     source: "hexbins",
            //     layout: {},
            //     paint: {
            //         "fill-extrusion-color": [
            //             "step",
            //             ["get", "max", ["get", "value"]],
            //             ...colors,
            //         ],
            //         "fill-extrusion-height": [
            //             "*",
            //             ["get", "max", ["get", "value"]],
            //             50000,
            //         ],
            //     },
            // });

            // Dot when single station
            map.addLayer({
                id: "single-station",
                type: "circle",
                source: "hexbins-centroid",
                layout: {},
                paint: {
                    "circle-color": "white",
                    "circle-radius": 2,
                    "circle-stroke-color": "#555",
                    "circle-stroke-width": 0.25,
                },
                filter: ["==", ["get", "length", ["get", "value"]], 1],
            });
        });

        map.on("zoomend", () => {
            // console.log("Zoom level: ", map.getZoom());
            // console.log("Zoom level (H3): ", zoomScale(map.getZoom()));
            // console.log("Bbox: ", bboxToPoly(map.getBounds()));

            map.getSource("hexbins").setData(
                getHexagons(
                    data,
                    zoomScale(map.getZoom()),
                    bboxToPoly(map.getBounds())
                )
            );
            map.getSource("hexbins-centroid").setData(
                toCentroids(
                    getHexagons(
                        data,
                        zoomScale(map.getZoom()),
                        bboxToPoly(map.getBounds())
                    )
                )
            );
        });

        map.on("moveend", () => {
            map.getSource("hexbins").setData(
                getHexagons(
                    data,
                    zoomScale(map.getZoom()),
                    bboxToPoly(map.getBounds())
                )
            );
            map.getSource("hexbins-centroid").setData(
                toCentroids(
                    getHexagons(
                        data,
                        zoomScale(map.getZoom()),
                        bboxToPoly(map.getBounds())
                    )
                )
            );
        });

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        map.on("mousemove", "hexbins-fill", (e) => {
            map.getCanvas().style.cursor = "pointer";
            // console.log(e.features[0]);
            // console.log(e.features[0].id);
            if (e.features.length > 0) {
                if (hoveredHexId !== null) {
                    map.setFeatureState(
                        { source: "hexbins", id: hoveredHexId },
                        { hover: false }
                    );
                }
                hoveredHexId = e.features[0].id;
                map.setFeatureState(
                    { source: "hexbins", id: hoveredHexId },
                    { hover: true }
                );
            }

            // Copy coordinates array.
            const coordinates = turf.centroid(
                // polygon(e.features[0].geometry.coordinates)
                turf.centroid(e.features[0].geometry)
            ).geometry.coordinates;

            const description = JSON.parse(e.features[0].properties.value).max;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
        });

        // map.on("mouseenter", "hexbins-fill", (e) => {
        //     // Change the cursor style as a UI indicator.
        //     map.getCanvas().style.cursor = "pointer";

        //     // Copy coordinates array.
        //     const coordinates = turf.centroid(
        //         // polygon(e.features[0].geometry.coordinates)
        //         turf.centroid(e.features[0].geometry)
        //     ).geometry.coordinates;

        //     const description = e.features[0].properties.value;

        //     // Ensure that if the map is zoomed out such that multiple
        //     // copies of the feature are visible, the popup appears
        //     // over the copy being pointed to.
        //     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        //     }

        //     // Populate the popup and set its coordinates
        //     // based on the feature found.
        //     popup.setLngLat(coordinates).setHTML(description).addTo(map);
        // });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.on("mouseleave", "hexbins-fill", () => {
            map.getCanvas().style.cursor = "";
            if (hoveredHexId !== null) {
                map.setFeatureState(
                    { source: "hexbins", id: hoveredHexId },
                    { hover: false }
                );
            }
            hoveredHexId = null;
            popup.remove();
        });
    }

    onDestroy(() => {
        if (map) map.remove();
    });
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://unpkg.com/mapbox-gl/dist/mapbox-gl.css"
        on:load={load}
    />
    <!-- <script src="https://cdn.jsdelivr.net/npm/@aesqe/mapboxgl-minimap"></script> -->
</svelte:head>

<div bind:this={container}>
    {#if map}
        <slot />
        <!-- https://www.youtube.com/watch?v=jMS1kKYt4JE -->
        <!-- @media print -->
        <!-- @media page -->
    {/if}
</div>

<style>
    div {
        width: 100%;
        height: 100%;
    }
</style>
