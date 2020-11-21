<script>
  export let courses;

	import Course from './Course.svelte';
	import Settings from './AnalyticsSettings.svelte';
  import stats from './stats';
  

  let showCourses = false;
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
      <h1>Analytics</h1>
      <ul id="analytics">
        <li>GPA: <span title="Pass/Fail courses do not count towards GPA">{courseStats.gpa}</span></li>
        <li>Credits: {courseStats.credits}</li>
      </ul>
  </div>
  <div>
    <Settings on:update={handleFilterUpdate}/>
    <input
      type="submit"
      value={showCourses ? "- Courses" : "+ Courses"}
      on:click={() => showCourses = !showCourses}
    />
  </div>
  {#if showCourses}
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
{/if}

<style>
 	table, th {
		border: 1px solid #666;
		border-collapse: collapse;
  }
  
  #analytics {
    list-style-type: none;

    display: grid;
    place-content: center;
    grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
  }

  #analytics > li {
    margin: 0 1em;
    margin-left: 0;
  }
</style>