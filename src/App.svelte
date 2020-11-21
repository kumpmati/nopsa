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
			<span id="title-1">Nettiopsu</span> <span id="title-2">Analytics</span>
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
	#title-1 {
		color: rgb(68, 132, 223);
	}

	#title-2 {
		font-style: italic;
		color: rgb(255, 255, 255);
		font-weight: lighter;
	}

  main {
    display: flex;
    flex-direction: column;
    position: relative;

    padding: 1em;
		margin: 5em auto;

    border-radius: .5em;

    width: 50%;
    max-width: 70em;

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
		z-index: 15;
  }

  #uploader {
		margin: 0 auto;
    height: 13em;
    border-radius: .3em;
    
    background-color: var(--light-bg);

    transition: transform 200ms,
			margin 200ms,
			width 200ms;
  }

  #uploader.small {
		top: 0;
		margin: 0;
    height: 3em;
		background: 0;
  }

  #results {
		margin-top: 2em;
    width: 100%;
  }

  #results.small {
    height: 0;
		margin: 0;
  }

  @media all and (max-width: 1000px) {
    main {
			width: 100vw;
			max-width: 100vw;
      height: 100vh;
      max-height: 100vh;

      border-radius: 0;
      margin: 0;
      padding: 1em;
      padding-top: 2em;
			box-sizing: border-box;
		}
		
		main.small {
			top: 5em;
			margin: 0 auto;
			border-radius: .5em;
			height: auto;
		}
	}
	
	@media all and (max-width: 700px) {
    main.small {
			top: 0;
			border-radius: 0;
			width: 100vw;
			height: 100vh;
    }
	}
</style>