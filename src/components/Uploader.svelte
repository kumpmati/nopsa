<script>
	export let submit;
	let files;
</script>

<span>
	<h2>Upload file</h2>
	<input type="file" accept=".pdf" bind:files />
	<input type="submit" value="Analyze" on:click={() => submit(files && files[0])} />
</span>