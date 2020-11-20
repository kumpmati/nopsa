<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js"
		integrity="sha512-Z8CqofpIcnJN80feS2uccz+pXWgZzeKxDsDNMD/dJ6997/LSRY+W4NmEt9acwR+Gt9OHN0kkI1CTianCwoqcjQ=="
		crossorigin="anonymous">
	</script>
</svelte:head>

<script>
	import Uploader from './Uploader.svelte';
	import ResultViewer from './ResultViewer/ResultViewer.svelte';
	import Spinner from './Spinner.svelte';
	import { analyzePDF } from '../parser.js';

	let loading = false;
	let parsedData = null;

	// parses and analyzes the file for course data
	async function analyze(file) {
		if(!file) return;
		
		try {
			loading = true;
			parsedData = await analyzePDF(file);
		} catch(err) {
			console.log(err)
		} finally {
			loading = false;
		}
	}
</script>

<main>
	<header>
		<h1>
			Nettiopsu analyser
		</h1>
	</header>
	<article>
		<section id="upload">
			<Uploader submit={analyze} />
			<Spinner active={loading} />
		</section>
		<section id="results">
			<ResultViewer courses={parsedData} />
		</section>
	</article>
</main>
