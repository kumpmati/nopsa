<script>
  import stats from './js/stats';
  export let data = [];

  // statistics for the visible courses
  $: courseStats = {
		gpa: stats.gpa(data),
		most_frequent: stats.mostFrequent(data, course => course.grade),
    credits: stats.totalCredits(data),
	}
</script>

<ul id="basic">
  <li>GPA: <span class="val" title="Pass/Fail courses do not count towards GPA">{courseStats.gpa}</span></li>
  <li>Most frequent: <span class="val">{courseStats.most_frequent}</span></li>
  <li>Credits: <span class="val">{courseStats.credits}</span></li>
</ul>

<style>
  #basic {
		display: grid;
		
		padding: 2em;
		width: 100%;

		border-radius: .3em;

		list-style-type: none;
		background-color: var(--accent-bg);
  }

  #basic > li {
		font-size: 1.5em;
		color: var(--text-col-accent);
    margin: .25em;
	}
	
	.val {
		font-weight: bold;
		color: white;
	}
</style>