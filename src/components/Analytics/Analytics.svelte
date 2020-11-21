<script>
  export let courses;

	import Course from './Course.svelte';
	import Settings from './AnalyticsSettings.svelte';
  import stats from './stats';
  
	let showCourses = false;
	let showSettings = false;
  let courseFilter = () => true;
	const handleFilterUpdate = (ns) => (courseFilter = ns.detail);

  // courses filtered by settings
	$: filteredCourses = courses ? courses.filter(courseFilter) : [];
  
  // statistics for the visible courses
  $: courseStats = {
		gpa: stats.gpa(filteredCourses),
		most_frequent: stats.mostFrequent(filteredCourses, course => course.grade),
    credits: filteredCourses.reduce((sum, curr) => sum + curr.credits, 0),
	}
</script>

{#if courses}
	<ul id="analytics">
		<li>GPA: <span class="val" title="Pass/Fail courses do not count towards GPA">{courseStats.gpa}</span></li>
		<li>Credits: <span class="val">{courseStats.credits}</span></li>
		<li>Most frequent grade: <span class="val">{courseStats.most_frequent.grade}</span></li>
	</ul>
	<div id="controls">
		<input
			type="submit"
			value="Courses"
			class:selected={showCourses}
			on:click|preventDefault={() => {
				showCourses = !showCourses;
				showSettings = false;
			}}
		/>
		<input type="submit"
			value="Settings"
			class:selected={showSettings}
			on:click|preventDefault={() => {
				showSettings = !showSettings;
				showCourses = false;
			}}
		/>
	</div>
	<div id="details">
		{#if showSettings}
			<Settings on:update={handleFilterUpdate}/>
		{/if}
		<table>
			{#if showCourses}
				<tr>
					<th>Name</th>
					<th>Code</th>
					<th>Grade</th>
					<th>Credits</th>
					<th>Level</th>
					<th>Date</th>
				</tr>
				{#each filteredCourses as course}
					<tr>
						<Course {...course} />
					</tr>
				{/each}
			{/if}
		</table>
	</div>
{/if}

<style>
  #analytics {
		display: grid;
		
		padding: 2em;
		width: 75%;
		margin: 2em auto;

		border-radius: .3em;

		list-style-type: none;
		background-color: var(--light-bg);
  }

  #analytics > li {
		font-size: 1.75em;
		color: rgb(150,150,150);
    margin: .25em;
	}
	
	.val {
		font-weight: bold;
		color: white;
	}
	
	table, th {
		border: 1px solid #666;
		border-collapse: collapse;
	}

	#controls {
		margin: 0 auto;
		display: flex;
		justify-content: space-evenly;
		width: 30%;
		min-width: max-content;
	}

	#controls > * {
		margin-right: .5em;
		margin-bottom: 1em;
	}

	#controls .selected {
		color: white;
	}
	
	#details {
		display: grid;
		grid-template-rows: repeat(auto-fill, minmax(50%, 1fr));
	}

</style>