<script>
  export let courses;

	import Course from './Course.svelte';
	import Settings from './AnalyticsSettings.svelte';
  import stats from './stats';

  let courseFilter = () => true;
  
  // courses filtered by settings
	$: filteredCourses = courses ? courses.filter(courseFilter) : [];
  
  // statistics for the visible courses
  $: courseStats = {
    gpa: stats.gpa(filteredCourses).toFixed(2),
    credits: filteredCourses.reduce((sum, curr) => sum + curr.credits, 0),
	}

  // updates the filter function
	const handleFilterUpdate = (ns) => (courseFilter = ns.detail);
</script>

<div>
	{#if courses}
		<div>
				<Settings on:update={handleFilterUpdate}/>
				<h1>Statistics</h1>
        <h2>GPA: {courseStats.gpa}</h2>
        <h2>Credits: {courseStats.credits}</h2>
		</div>
		<table id="courses">
			<tr>
				<th>Name</th>
				<th>Code</th>
        <th>Grade</th>
        <th>Credits</th>
				<th>Type</th>
				<th>Date</th>
			</tr>
			{#each filteredCourses as course}
        <Course
          {...course}
        />
			{/each}
		</table>
	{/if}
</div>

<style>
 	table, th {
		border: 1px solid #666;
		border-collapse: collapse;
	}
</style>