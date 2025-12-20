<script>
    import { createEventDispatcher } from "svelte";
    import { Key, RefreshCw, AlertCircle } from "lucide-svelte";

    const dispatch = createEventDispatcher();

    export let hasRefreshToken = false;

    let loading = false;
    let error = "";

    const handleRefresh = async () => {
        loading = true;
        error = "";

        try {
            const response = await fetch("/api/refresh-token", {
                method: "POST",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to refresh token");
            }

            const data = await response.json();
            if (data.success) {
                dispatch("tokenGenerated", true);
            } else {
                throw new Error("Unknown error during token refresh");
            }
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    };
</script>

<div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem;">
    <form on:submit|preventDefault={handleRefresh}>
        {#if hasRefreshToken}
            <button
                type="submit"
                class="btn btn-primary"
                disabled={loading}
                style="width: 100%;"
            >
                {#if loading}
                    <RefreshCw
                        size={18}
                        class="spin"
                        style="animation: spin 1s linear infinite"
                    />
                    Refreshing...
                {:else}
                    <RefreshCw size={18} />
                    Refresh Models
                {/if}
            </button>
        {/if}

        <a
            href="/auth/login"
            class="btn btn-secondary"
            style="width: 100%; margin-top: 1rem; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
        >
            <Key size={18} />
            Sign in with Google
        </a>

        <style>
            @keyframes spin {
                100% {
                    transform: rotate(360deg);
                }
            }
        </style>
    </form>

    {#if error}
        <div
            style="
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: var(--radius-md);
            color: #fca5a5;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        "
        >
            <AlertCircle size={20} />
            <span>{error}</span>
        </div>
    {/if}
</div>
