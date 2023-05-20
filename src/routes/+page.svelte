<script>
    let counter = 0;
</script>
<style>
    button {
        background: red;
        color:#FFF;
    }
</style>

I'm counting ... {counter}
<button on:click={() => {counter++}}>Count up</button>