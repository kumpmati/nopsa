<span class:visible={active} class="spinner">⟳</span>

<script>
	export let active;
</script>

<style>
	@keyframes spin {
		from { transform: rotate(0) }
		to { transform: rotate(360deg) }
	}

	.spinner {
		opacity: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5em;
		width: 1em;
		height: 1em;
		transform-origin: center;
		animation: spin 500ms infinite;
		transition: opacity 100ms;
	}

	.spinner.visible {
		opacity: 1;
	}
</style>