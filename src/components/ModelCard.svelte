<script>
    import { onMount, onDestroy } from "svelte";
    import { Clock, Box, Star } from "lucide-svelte";
    import { formatDistanceToNow } from "date-fns";

    export let modelId;
    export let data;

    let timeLeft = "";
    let interval;

    $: ({
        displayName,
        quotaInfo,
        maxTokens,
        maxOutputTokens,
        recommended,
        supportsThinking,
        supportsImages,
    } = data);

    $: remainingFraction = quotaInfo?.remainingFraction ?? 0;
    $: resetTime = quotaInfo?.resetTime ? new Date(quotaInfo.resetTime) : null;

    // Calculate color based on remaining quota
    $: getQuotaColor = (fraction) => {
        if (fraction > 0.5) return "var(--color-primary)"; // High quota
        if (fraction > 0.2) return "var(--color-secondary)"; // Medium quota
        return "var(--color-accent)"; // Low quota
    };

    $: quotaColor = getQuotaColor(remainingFraction);
    $: percentage = (remainingFraction * 100).toFixed(2);

    const updateTimer = () => {
        if (!resetTime) return;
        const now = new Date();
        if (now >= resetTime) {
            timeLeft = "Quota reset";
        } else {
            timeLeft = formatDistanceToNow(resetTime, { addSuffix: true });
        }
    };

    $: if (resetTime) {
        updateTimer();
        if (interval) clearInterval(interval);
        interval = setInterval(updateTimer, 60000);
    }

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });
</script>

<div
    class="glass-panel"
    style="
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    border: {recommended
        ? '1px solid var(--color-primary)'
        : 'var(--glass-border)'};
    transition: transform 0.2s ease;
"
>
    {#if recommended}
        <div
            style="
            position: absolute;
            top: 1rem;
            right: 1rem;
            color: var(--color-accent);
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(255,255,255,0.05);
            padding: 0.25rem 0.5rem;
            border-radius: 1rem;
        "
        >
            <Star size={12} fill="currentColor" />
        </div>
    {/if}

    <div style="margin-bottom: 1.5rem;">
        <h3
            style="font-size: 1.1rem; margin-bottom: 0.5rem; padding-right: 2rem;"
        >
            {displayName || modelId}
        </h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            {#if supportsThinking}
                <span
                    style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.1);"
                >
                    Thinking
                </span>
            {/if}
            {#if supportsImages}
                <span
                    style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.1);"
                >
                    Images
                </span>
            {/if}
        </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
        <div
            style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;"
        >
            <span style="color: var(--color-text-muted);">Quota Remaining</span>
            <span style="font-weight: 600; color: {quotaColor};"
                >{percentage}%</span
            >
        </div>
        <div
            style="
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            overflow: hidden;
        "
        >
            <div
                style="
                height: 100%;
                width: {percentage}%;
                background: {quotaColor};
                border-radius: 3px;
                transition: width 1s ease-out;
            "
            />
        </div>
    </div>

    <div
        style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;"
    >
        <div
            style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); cursor: help;"
            title={resetTime ? resetTime.toLocaleString() : ""}
        >
            <Clock size={16} />
            <span>Resets {timeLeft}</span>
        </div>
        <div
            style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted);"
        >
            <Box size={16} />
            <span
                >Context: {maxTokens ? maxTokens.toLocaleString() : "N/A"}</span
            >
        </div>
    </div>
</div>
