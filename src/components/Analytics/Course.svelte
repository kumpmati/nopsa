<script>
	export let code = "";
	export let name = "";
	export let grade = 0;
	export let credits = 0;
	export let type = "";
  export let date = null;

  import { courseTypes } from './misc.js';
  $: verboseType = courseTypes[type] || "";
</script>

<tr class="course">
	<td class="name">{name}</td>
	<td class="code">
		<a href={`https://opas.peppi.utu.fi/fi/haku/${code}`} target="_blank" referrerpolicy="no-referrer">
			{code}
		</a>
	</td>
	<td class="grade">{grade}</td>
	<td class="credits">{credits}</td>
	<td class="type">{verboseType}</td>
	<td class="date">{date.toLocaleDateString()}</td>
</tr>

<style>
	.course .name {
		font-weight: bold;
	}
</style>