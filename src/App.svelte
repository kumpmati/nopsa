<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js"
		integrity="sha512-Z8CqofpIcnJN80feS2uccz+pXWgZzeKxDsDNMD/dJ6997/LSRY+W4NmEt9acwR+Gt9OHN0kkI1CTianCwoqcjQ=="
		crossorigin="anonymous">
	</script>
</svelte:head>

<script>
	import Uploader from './components/Uploader.svelte';
	import Analytics from './components/Analytics/Analytics.svelte';
	import Spinner from './components/Spinner.svelte';
	import { analyzePDF } from './parser.js';

	let loading = false;
	let parsedData = null;

	// parses the PDF and extracts all course data from it
	async function analyze(file) {
		if(!file) return;
		
		try {
			loading = true;
			parsedData = await analyzePDF(file);
		} catch(err) {
			console.log(err);
		} finally {
			loading = false;
		}
	}
</script>

<main>
	<header>
		<h1>
			Nettiopsu Analytics
		</h1>
	</header>
	<article>
		<section id="upload">
			<Uploader submit={analyze} on:clear={() => parsedData = null}/>
			<Spinner active={loading} />
		</section>
		<section id="results">
      <Analytics courses={parsedData} />
		</section>
	</article>
</main>
