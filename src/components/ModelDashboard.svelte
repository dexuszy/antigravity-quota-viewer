<script>
    import { onMount, onDestroy } from 'svelte';
    import { Grid, Loader, AlertTriangle } from 'lucide-svelte';
    import ModelCard from './ModelCard.svelte';

    export let isAuthenticated = false;

    let models = {};
    let loading = false;
    let error = '';
    let autoUpdate = false;
    let interval;
    let projectId = '';
    let lastUpdated = null;

    const fetchProjectConfig = async () => {
        try {
            loading = true;
            const response = await fetch('/v1internal/loadCodeAssist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'antigravity/1.11.2 darwin/arm64',
                },
                body: JSON.stringify({
                    metadata: {
                        ideType: "ANTIGRAVITY"
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch project config: ${response.statusText}`);
            }

            const data = await response.json();
            projectId = data.cloudaicompanionProject;
        } catch (err) {
            error = err.message;
            loading = false;
        }
    };

    const fetchModels = async (silent = false) => {
        if (!isAuthenticated || !projectId) return;

        if (!silent) {
            loading = true;
            error = '';
        }

        try {
            // Request goes to proxy, which injects the Authorization header
            const response = await fetch('/v1internal/fetchAvailableModels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'antigravity/1.11.2 darwin/arm64',
                },
                body: JSON.stringify({ project: projectId }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.statusText} ${await response.text()}`);
            }

            const data = await response.json();
            models = data.models || {};
            lastUpdated = new Date();
        } catch (err) {
            if (!silent) error = err.message;
            console.error('Fetch error:', err);
        } finally {
            if (!silent) loading = false;
        }
    };

    $: if (isAuthenticated && !projectId) {
        fetchProjectConfig();
    }

    $: if (isAuthenticated && projectId) {
        fetchModels();
    }

    $: if (autoUpdate && isAuthenticated) {
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
            fetchModels(true);
        }, 10000);
    } else if (interval) {
        clearInterval(interval);
        interval = undefined;
    }

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });

    // Sort models: Recommended first, then Alphabetical
    $: sortedModels = Object.entries(models).sort(([, a], [, b]) => {
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return (a.displayName || '').localeCompare(b.displayName || '');
    });

    const toggleAutoUpdate = () => {
        autoUpdate = !autoUpdate;
    };
</script>

{#if !isAuthenticated}
    <div style="text-align: center; padding: 4rem; color: var(--color-text-muted);">
        <p>Generate an access token to view available models.</p>
    </div>
{:else}
    <div class="animate-fade-in">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 50%;">
                    <Grid size={24} color="var(--color-secondary)" />
                </div>
                <div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Model Availability</h2>
                    <p style="color: var(--color-text-muted);">Real-time quota and status for AI models</p>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
                {#if lastUpdated}
                    <span style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 0.5rem;">
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                {/if}
                <span style="font-size: 0.85rem; color: var(--color-text-muted);">Auto-update</span>
                <button
                    on:click={toggleAutoUpdate}
                    style="
                        background: {autoUpdate ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'};
                        border: none;
                        border-radius: 1rem;
                        width: 3rem;
                        height: 1.5rem;
                        position: relative;
                        cursor: pointer;
                        transition: background 0.2s ease;
                    "
                >
                    <div style="
                        position: absolute;
                        top: 0.25rem;
                        left: {autoUpdate ? '1.75rem' : '0.25rem'};
                        width: 1rem;
                        height: 1rem;
                        background: white;
                        border-radius: 50%;
                        transition: left 0.2s ease;
                    " />
                </button>
            </div>
        </div>

        {#if loading}
            <div style="display: flex; justify-content: center; padding: 4rem;">
                <Loader class="spin" size={48} color="var(--color-primary)" style="animation: spin 1s linear infinite" />
            </div>
        {/if}

        {#if error}
            <div style="
                padding: 1rem;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                border-radius: var(--radius-md);
                color: #fca5a5;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            ">
                <AlertTriangle size={20} />
                <span>{error}</span>
            </div>
        {/if}

        {#if !loading && !error}
            <div class="grid-dashboard">
                {#each sortedModels as [id, data] (id)}
                    <ModelCard modelId={id} {data} />
                {/each}
            </div>
        {/if}
    </div>
{/if}
