<script>
    export let title = "Export";
</script>

<button onclick="window.print()" type="button" id='export-btn'>
    {title}
</button> 

<style>
  #export-btn {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: #333;
        color: white;
        border-radius: 5px;
        z-index: 99;
    }
</style>