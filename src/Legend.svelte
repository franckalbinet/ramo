<script>
    import { asColorLegend } from "./lib/scales";
    export let title = "Dose rate";
    export let scale;

    // console.log(asColorLegend(scale));
</script>

<div id="legend">
    <h1>{title}</h1>
    <div>
        {#each asColorLegend(scale) as [value, color]}
            <div>
                <span class="legend-key" style="background-color: {color}" />
                <span class="legend-value">{value}</span>
            </div>
        {/each}
    </div>
</div>

<style>
    h1 {
        font-size: 16px;
    }
    #legend {
        position: absolute;
        bottom: 100px;
        left: 10px;
        background-color: #fff;
        /* color: white; */
        border-radius: 5px;
        padding: 20px;
        z-index: 99;
    }
    .legend-key {
        display: inline-block;
        border-radius: 20%;
        width: 10px;
        height: 10px;
        margin-right: 5px;
    }
    .legend-value {
        font-size: 14px;
    }
</style>
