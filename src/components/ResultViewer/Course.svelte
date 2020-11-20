<script>
	export let code = "";
	export let name = "";
	export let grade = 0;
	export let points = 0;
	export let type = "";
	export let date = null;
</script>

<tr class="course">
	<td class="name">{name}</td>
	<td class="code">
		<a href={`https://opas.peppi.utu.fi/fi/haku/${code}`} target="_blank" referrerpolicy="no-referrer">
			{code}
		</a>
	</td>
	<td class="points">{grade} / {points}</td>
	<td class="type">{type}</td>
	<td class="date">{date.toLocaleDateString()}</td>
</tr>

<style>
	.course .name {
		font-weight: bold;
	}

	.course .code {
		opacity: 0.7;
	}

	.course .date {
		color: blue;
	}
</style>