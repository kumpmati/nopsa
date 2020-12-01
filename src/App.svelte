
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
			<span id="title-1">N</span><span id="title-2">opsa</span>
		</h1>
		<span id="info-buttons">
			<a
				class="button"
				href="help.html"
				title="Help"
			>?</a>
		</span>
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
    font-style: italic;
		color:var(--title-col);
	}

	#title-2 {
		font-style: italic;
		color: white;
		font-weight: lighter;
	}

	#info-buttons {
		position: absolute;
		top: 1em;
		right: 1em;
		display: flex;
	}

  main {
    display: flex;
    flex-direction: column;
    position: relative;

    padding: 1em;
		margin: 5em auto;

    border-radius: .5em;

    width: 60%;
    max-width: 70em;

    overflow-y: auto;

    color: var(--text-col);
		background-color: var(--bg);
  }

  main.small {
		width: 25em;
		height: 20em;
  }

  header {
		margin-bottom: 1.5em;
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
		margin-top: 1.5em;
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