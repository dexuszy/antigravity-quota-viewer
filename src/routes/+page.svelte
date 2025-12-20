<script>
    import TokenManager from "../components/TokenManager.svelte";
    import ModelDashboard from "../components/ModelDashboard.svelte";

    export let data;

    let isAuthenticated = false;

    const handleTokenGenerated = (event) => {
        isAuthenticated = event.detail;
    };
</script>

<TokenManager
    hasRefreshToken={data.hasRefreshToken}
    on:tokenGenerated={handleTokenGenerated}
/>
<ModelDashboard {isAuthenticated} />
