<script>
  export let code = "";
	export let name = "";
	export let grade = 0;
	export let credits = 0;
	export let level = "";
  export let date = null;

  import { studyLevels } from './misc.js';
  $: descriptiveLevel = studyLevels[level] || "";
</script>

<tr>
	<td class="name">{name}</td>
	<td class="code">
		<a href={`https://opas.peppi.utu.fi/fi/haku/${code}`} target="_blank" referrerpolicy="no-referrer">
			{code}
		</a>
	</td>
	<td class="grade">{grade}</td>
	<td class="credits">{credits}</td>
	<td class="level">{descriptiveLevel}</td>
	<td class="date">{date.toLocaleDateString()}</td>
</tr>

<style>
	td {
		padding: .5em 0;
	}

	.name {
		font-weight: light;
		color: var(--text-col-subtle);
	}

	.code {
		font-weight: bold;
		font-style: italic;
	}
	
	.code a {
		color: var(--title-col);
		text-decoration: none;
	}

	.code a:hover {
		filter:brightness(1.5);
	}

	.code a:visited {
		color: rgb(102, 88, 143);
	}

	.grade {
		text-align: center;
		font-style: italic;
		font-size: 1.125em;
		font-weight: bold;
	}

	.credits {
		color: var(--text-col-subtle);
		text-align: center;
  }
  
  .date {
    color: var(--text-col-subtle);
    text-align: right;
  }
</style>