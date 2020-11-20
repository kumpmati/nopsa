<script>
	import Course from './Course.svelte';
	import Settings from './ResultViewerSettings.svelte';
	import stats from './stats';

	export let courses;
	let courseFilter;
	let showSettings = false;
	
	$: filteredCourses = courses ? courses.filter(courseFilter || (() => true)) : [];
	$: courseStats = {
		gpa: stats.gpa(filteredCourses).toFixed(2)
	}

	const handleFilterUpdate = (ns) => {
		console.log(ns.detail);
		courseFilter = ns.detail;
	}
</script>

<div>
	{#if courses}
		<div>
				<Settings on:update={handleFilterUpdate}/>
				<h1>Statistics</h1>
				<h2>GPA: {courseStats.gpa}</h2>
		</div>
		<table id="courses">
			<tr>
				<th>Name</th>
				<th>Code</th>
				<th>Grade / Points</th>
				<th>Type</th>
				<th>Date</th>
			</tr>
			{#each filteredCourses as course}
					<Course {...course} />
			{/each}
		</table>
	{:else}
		<div>
			<h2>...</h2>
		</div>
	{/if}
</div>

<style>
 	table, th {
		border: 1px solid #666;
		border-collapse: collapse;
	}
</style>