<script>
  import { createEventDispatcher } from 'svelte';
  import courseFilterFunc from './filter';
  import { studyLevels, toggleInArr } from './misc';

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

<form>
	<fieldset>
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
	<fieldset>
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
	<fieldset>
		<h2>Level</h2>
		{#each Object.entries(studyLevels) as [levelCode, levelName]}
			<label>
				<h3>{levelName}</h3>
				<input
					type="checkbox"
					value={levelCode}
					checked={selectedLevels.indexOf(levelCode) !== -1}
					on:click={() => selectedLevels = toggleInArr(selectedLevels, levelCode)}
				/>
			</label>
		{/each}
	</fieldset>
</form>