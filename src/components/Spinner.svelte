<span class:visible={active} class="spinner">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-refresh-cw">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
</span>

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
		transition: opacity 200ms;
	}

	.spinner.visible {
		opacity: 1;
	}
</style>