import { geoToH3 } from "h3-js";
import { h3SetToFeatureCollection } from "geojson2h3";
import { max, rollup, polygonContains } from "d3";
// import centroid from "@turf/centroid";
import * as turf from '@turf/turf'
// import "@turf/turf";
// import { mapbox } from "mapbox.js";

export function getHexagons(data, zoom, bbox, attr = "dose") {

    // Filter out measurements outside bbox
    let dataInBbox = data.filter((d) => polygonContains(bbox, [d.lon, d.lat]));

    // Generate H3 index and grouping
    const hexIdxGrp = rollup(
        dataInBbox.map((d) => ({ ...d, h3Idx: geoToH3(d.lat, d.lon, zoom) })),
        //   (v) => max(v, (d) => d[attr]),
        // (v) => { return { values: { max: max(v, (d) => d[attr]), length: v.length } }; },
        (v) => { return { max: max(v, (d) => d[attr]), length: v.length }; },
        (d) => d.h3Idx
    );

    // Convert to GeoJSON
    const hexagons = h3SetToFeatureCollection(
        [...hexIdxGrp.keys()],
        (hex) => ({
            value: hexIdxGrp.get(hex)
        })
    );

    fixTransmeridian(hexagons);

    // console.log("Nb. of hexagon features: ", hexagons.features.length);
    return hexagons;
}

export function bboxToPoly(bbox) {
    return [
        [bbox._sw.lng, bbox._ne.lat],
        [bbox._sw.lng, bbox._sw.lat],
        [bbox._ne.lng, bbox._sw.lat],
        [bbox._ne.lng, bbox._ne.lat]
    ];
}

export function toCentroids(geojson) {
    return {
        type: "FeatureCollection",
        features: geojson.features.map((d) => ({ ...d, geometry: turf.centroid(d.geometry).geometry }))
    };
}

// Sources: https://observablehq.com/@nrabinowitz/mapbox-utils
function fixTransmeridian() {

    function fixTransmeridianCoord(coord) {
        const lng = coord[0];
        coord[0] = lng < 0 ? lng + 360 : lng;
    }

    function fixTransmeridianLoop(loop) {
        let isTransmeridian = false;
        for (let i = 0; i < loop.length; i++) {
            // check for arcs > 180 degrees longitude, flagging as transmeridian
            if (Math.abs(loop[0][0] - loop[(i + 1) % loop.length][0]) > 180) {
                isTransmeridian = true;
                break;
            }
        }
        if (isTransmeridian) {
            loop.forEach(fixTransmeridianCoord);
        }
    }

    function fixTransmeridianPolygon(polygon) {
        polygon.forEach(fixTransmeridianLoop);
    }

    function fixTransmeridian(feature) {
        const { type } = feature;
        if (type === 'FeatureCollection') {
            feature.features.map(fixTransmeridian);
            return;
        }
        const { type: geometryType, coordinates } = feature.geometry;
        switch (geometryType) {
            case 'LineString':
                fixTransmeridianLoop(coordinates);
                return;
            case 'Polygon':
                fixTransmeridianPolygon(coordinates);
                return;
            case 'MultiPolygon':
                coordinates.forEach(fixTransmeridianPolygon);
                return;
            default:
                throw new Error(`Unknown geometry type: ${geometryType}`);
        }
    }

    return fixTransmeridian;
}

