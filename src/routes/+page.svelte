<script lang="ts">
    import { onMount } from "svelte";
    import { skirmishes, apiData } from "../stores/CurrentMatchup";

    onMount(async () => {
        fetch("https://api.guildwars2.com/v2/wvw/matches")
            .then((response) => response.json())
            .then((data) =>
                fetch(`https://api.guildwars2.com/v2/wvw/matches?ids=${data}`)
            )
            .then((response) => response.json())
            .then((data) => {
                apiData.set(data);
            })
            .catch((error) => {
                console.log(error);
                return [];
            });
    });
</script>

<p>{$skirmishes}</p>
