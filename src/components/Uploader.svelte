<script>
  export let submit;
  export let loading;
  export let message;

  import Spinner from './Spinner.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let files = null;

  // resets file input
  const reset = () => {
    document.querySelector("#file-input").value = null; // resets file input element
    files = null; // resets file list
    dispatch("reset");
  }


  const setupListener = () => {
    if (!"serviceWorker" in navigator) return;
    
    navigator.serviceWorker
      .addEventListener("message", (e) => {
        switch(e.data.action) {
          case "share":
            alert(JSON.stringify(e.data));
            break;
        }
      });
  };
</script>

<svelte:window on:load={setupListener} />

<section>
	{#if message}
		<h1 id="message">{message}</h1>
	{/if}
	<div id="dropzone">
		<input
			id="file-input"
			type="file"
			accept=".pdf"
			bind:files
			on:change={() => submit(files && files[0])}
		/>
		{#if !files}
			<label for="file-input"><b>Open</b> transcript</label>
		{:else}	
			<input type="submit" value="Reset" on:click={reset} />
		{/if}
		<span id="spinner" class:hidden={!loading}>
			<Spinner active={loading} />
		</span>
	</div>
</section>

<style>
  section {
    position: relative;
    height: 100%;
	}

  #dropzone {
		font-size: 1.25em;

    display: grid;
    place-content: center;
    position: absolute; 
    top: 0;
    left: 0;
    
    width: 100%;
    height: 100%;
  }

	#dropzone > label {
		color: lightgray;
		cursor: pointer;
	}

	#dropzone > label:hover {
		color: white;
	}

  #file-input {
    display: none;
  }

  #spinner {
    border-radius: 100%;
    padding: .25em;
    background-color: var(--bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
		pointer-events: none;
  }

  #spinner.hidden {
		display: none;
  }

  #message {
    z-index: 10;
    color: rgb(238, 131, 131);
    text-align: center;
    top: 25%;
    position: relative;
  }
</style>