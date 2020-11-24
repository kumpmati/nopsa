<script>
	export let visible;

  import { createEventDispatcher } from 'svelte';
  import courseFilterFunc from './filter';
  import { studyLevels } from './misc';

	const dispatch = createEventDispatcher();
	
	// filter settings
	let gradeFilter = "all";
	let startDate = new Date(0);
  let endDate = new Date();
  let selectedLevels = [];

  // TODO: refactor to Analytics.svelte
	$: courseFilter = (course) => courseFilterFunc(course, {
		grades: gradeFilter,
    date_range: { start: startDate, end: endDate },
    study_levels: selectedLevels
	});
	
	$: submit = dispatch("update", courseFilter);
</script>

{#if visible}
	<form>
		<fieldset class="_50" id="grades">
			<h2>Grades</h2>
			<label>
				<h3>Type</h3>
				<select on:blur={submit} bind:value={gradeFilter}>
					<option value="all">All</option>
					<option value="numeric">Numeric only</option>
					<option value="pass-fail">Pass/Fail only</option>
				</select>
			</label>
		</fieldset>
		<fieldset class="_50" id="dates">
			<h2>Date</h2>
			<label>
				<h3>Start date</h3>
				<input type="date" on:change={submit} bind:value={startDate} max={endDate} />
			</label>
			<label>
				<h3>End date</h3>
				<input type="date" on:change={submit} bind:value={endDate} min={startDate} />
			</label>
		</fieldset>
		<fieldset class="_100">
			<h2>Level</h2>
			<span id="selected-levels">
				{#each Object.entries(studyLevels) as [symbol, name]}
					<label>
						<input
						type="checkbox"
						value={symbol}
						bind:group={selectedLevels}
						/>
						<h3>{name}</h3>
					</label>
				{/each}
			</span>
		</fieldset>
	</form>
{/if}

<style>
	form {
		width: 100%;
		display: flex;
		flex-wrap: wrap;

		--fieldset-gap: .25em;
	}

	form input, form select {
		background-color:var(--dark-contrast);
	}
	
	form input:focus {
		border-color: var(--bg);
	}

	fieldset {
		width: 100%;

		margin: var(--fieldset-gap);
		padding: .75em;

		border: none;
		border-radius: .3em;

		background-color: var(--light-bg);
	}

	fieldset > h2 {
		color: var(--text-col-subtle);
		margin-bottom: .5em;
	}

	fieldset > label > h3 {
		margin-bottom: .25em;
	}

	fieldset > label {
		margin: .5em 0;
	}
	
	#grades {
		width: 100%;
	}

	#grades option {
		background-color: var(--bg);
		color: var(--text-col-subtle);
	}
	
	#dates input:hover {
		color: var(--text-col-subtle);
	}

	#dates input:focus {
		color: var(--text-col);
	}

	#selected-levels {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13em, 1fr));
		grid-auto-rows: 2.5em;
	}

	#selected-levels > label {
		display: flex;
		align-items: center;
	}

	#selected-levels > label > input {
		margin-right: .5em;
		font-size: .75rem;
	}

	._50 {
		flex-basis: calc(50% - 2* var(--fieldset-gap));
	}

	._100 {
		flex-basis: calc(100% - 2* var(--fieldset-gap));
	}
</style>