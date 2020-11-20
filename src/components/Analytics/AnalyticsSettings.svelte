<script>
	import { createEventDispatcher } from 'svelte';
	import courseFilterFunc from './filter';
	const dispatch = createEventDispatcher();
	let visible = false;
	
	// filter settings
	let gradeFilter = "all";
	let startDate = new Date(0);
	let endDate = new Date();

	
	$: courseFilter = (course) => courseFilterFunc(course, {
		grades: gradeFilter,
		date_range: { start: startDate, end: endDate }
	});
	
	$: submit = dispatch("update", courseFilter);
</script>

<form>
	<input type="submit"
		value={visible ? "Hide settings" : "Show settings"}
		on:click|preventDefault={() => visible = !visible}
	/>
	{#if visible}
	<label>
		<h2>Grades</h2>
		<!-- svelte-ignore a11y-no-onchange -->
		<select on:blur={submit} bind:value={gradeFilter}>
			<option value="all">All</option>
			<option value="numeric">Numeric only</option>
			<option value="pass-fail">Pass/Fail only</option>
		</select>
	</label>
	<section>
		<h2>Date</h2>
		<label>
			<h3>Start date</h3>
			<input type="date" on:change={submit} bind:value={startDate} max={endDate} />
		</label>
		<label>
			<h3>End date</h3>
			<input type="date" on:change={submit} bind:value={endDate} min={startDate} />
		</label>
	</section>
	{/if}
</form>