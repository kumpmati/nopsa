<script>
  export let code = "";
	export let name = "";
	export let grade = 0;
	export let credits = 0;
	export let level = "";
  export let date = null;

  import { studyLevels } from './misc.js';
  $: verboseLevel = studyLevels[level] || "";
</script>

<td class="name">{name}</td>
<td class="code">
  <a href={`https://opas.peppi.utu.fi/fi/haku/${code}`} target="_blank" referrerpolicy="no-referrer">
    {code}
  </a>
</td>
<td class="grade">{grade}</td>
<td class="credits">{credits}</td>
<td class="level">{verboseLevel}</td>
<td class="date">{date.toLocaleDateString()}</td>

<style>
	.name {
		font-weight: bold;
	}
</style>