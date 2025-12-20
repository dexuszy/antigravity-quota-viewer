<script>
    import '../index.css';
</script>

<div class="app-container">
    <header style="margin-bottom: 3rem; text-align: center;">
        <h1>Antigravity Quota</h1>
    </header>

    <main>
        <slot />
    </main>

    <footer style="
        margin-top: 4rem;
        text-align: center;
        color: var(--color-text-muted);
        font-size: 0.85rem;
        padding-bottom: 2rem;
    ">
        <p>© 2025 Vector Planetarium. Internal Tool.</p>
    </footer>
</div>
