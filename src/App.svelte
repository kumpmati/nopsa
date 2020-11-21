<svelte:head>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js"
		integrity="sha512-Z8CqofpIcnJN80feS2uccz+pXWgZzeKxDsDNMD/dJ6997/LSRY+W4NmEt9acwR+Gt9OHN0kkI1CTianCwoqcjQ=="
		crossorigin="anonymous">
	</script>
</svelte:head>

<script>
	import Uploader from './components/Uploader.svelte';
	import Analytics from './components/Analytics/Analytics.svelte';
	import { analyzePDF } from './parser.js';

  let loading = false;
  let errMessage = null;
	let parsedData = null;

	// parses the PDF and extracts all course data from it
	async function analyze(file) {
		if(!file) return;
		
		try {
			loading = true;
      parsedData = await analyzePDF(file);
      errMessage = null;
		} catch(err) {
      errMessage = err;
		} finally {
      loading = false;
		}
	}
</script>

<main class:small={parsedData === null}>
	<header class:small={parsedData !== null}>
		<h1>
			Nettiopsu Analytics
		</h1>
	</header>
	<article>
		<section id="uploader" class:small={parsedData !== null}>
      <Uploader
        submit={analyze}
        loading={loading}
        message={errMessage}
        on:reset={() => {
          parsedData = null;
          errMessage = null;
        }}
      />
		</section>
		<section id="results" class:small={parsedData === null}>
      <Analytics courses={parsedData} />
		</section>
	</article>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    position: relative;

    border-radius: .5em;
    padding: 1em;
    margin: 3em auto;

    width: 100vh;
    max-width: 70em;

    height: calc(100vh - 6em);
    max-height: 40em;

    overflow-y: auto;

    color: rgb(230, 230, 230);
    background-color: rgb(50,50,50);
  }

  main.small {
    width: 25em;
    height: 20em;
  }

  header {
    margin-bottom: 2em;
    transition: margin 200ms;
  }

  header.small {
    margin-bottom: 1em;
  }

  #uploader {
    margin: 0 auto;
    padding: 1em;

    height: 13.75em;

    border-radius: .5em;
    
    background-color: var(--light-bg);

    transition: height 200ms;
    overflow: hidden;
  }

  #uploader.small {
    height: 4em;
  }

  #results {
    width: 100%;
    transition: height 200ms;
  }

  #results.small {
    height: 0;
  }

  @media all and (max-width: 850px) {
    main {

      width: 100vw;
      height: 100vh;
      max-height: 100vh;

      border-radius: 0;
      margin: 0;
      padding: 0;
      padding-top: 2em;
      box-sizing: border-box;
    }

    main.small {
      width: 100vw;
      height: 100vh;
    }

    #uploader {
      height: 50vh;
    }
  }
</style>