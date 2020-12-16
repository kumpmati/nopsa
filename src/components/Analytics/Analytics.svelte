<script>
  export let courses;

  import Basic from './Basic.svelte';
	import Course from './Course.svelte';
	import Settings from './CourseFilters.svelte';
  
	let showCourses = true;
  let showSettings = false;
  
  let filteredCourses = [];
  let courseFilter = () => true;

  $: {
    if (!courses) courseFilter = () => true; // reset filter when no courses
    filteredCourses = courses ? courses.filter(courseFilter) : [];
  }

</script>

{#if courses}
  <div id="analytics">
    <Basic data={filteredCourses} />
  </div>
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
    <Settings
      visible={showSettings}
      on:update={(ns) => courseFilter = ns.detail}
    />
		<table>
			{#if showCourses}
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Grade</th>
            <th>Credits</th>
            <th>Level</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredCourses as course}
            <Course {...course} />
          {/each}
        </tbody>
			{/if}
		</table>
	</div>
{/if}

<style>
  #analytics {
    margin: 2em 0;
    display: flex;
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
    overflow-x: auto;
		display: grid;
		grid-template-rows: repeat(auto-fill, minmax(50%, 1fr));
	}

	th {
		text-align: left;
		padding: 1em 0;
	}

</style>