<script>
  export let courses;

	import Course from './Course.svelte';
	import Settings from './AnalyticsSettings.svelte';
  import stats from './stats';
  
  let courseFilter = () => true;
	const handleFilterUpdate = (ns) => (courseFilter = ns.detail);

  // courses filtered by settings
	$: filteredCourses = courses ? courses.filter(courseFilter) : [];
  
  // statistics for the visible courses
  $: courseStats = {
    gpa: stats.gpa(filteredCourses),
    credits: filteredCourses.reduce((sum, curr) => sum + curr.credits, 0),
	}

</script>

{#if courses}
  <div>
      <Settings on:update={handleFilterUpdate}/>
      <h1>Statistics</h1>
      <h2>GPA: <span title="Pass/Fail courses do not count towards GPA">{courseStats.gpa}</span></h2>
      <h2>Credits: {courseStats.credits}</h2>
  </div>
  <table id="courses">
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
  </table>
{/if}

<style>
 	table, th {
		border: 1px solid #666;
		border-collapse: collapse;
	}
</style>