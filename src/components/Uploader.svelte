<script>
  export let submit;
  export let loading;
  export let message;

  import Spinner from './Spinner.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let files = null;

  // reset file input
  const reset = () => {
    document.querySelector("#file-input").value = null; // resets file input element
    files = null; // resets file list
    dispatch("reset");
  }
</script>

<section>
  {#if message}
    <h1 id="message">{message}</h1>
  {/if}
  {#if !files}
    <h2>Open transcript</h2>
  {/if}
  <div id="dropzone">
    <input
      id="file-input"
      type="file"
      accept=".pdf"
      bind:files
      on:change={() => submit(files && files[0])}
    />
    {#if files && files.length > 0}
      <input type="submit" value="Reset" on:click={reset} />
    {:else}
      <label for="file-input"><b>Drop file here</b> or <b>Open</b></label>
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

  section > h2 {
    color: darkgray;
  }

  #dropzone {
    display: grid;
    place-content: center;
    position: absolute;
    
    top: 0;
    left: 0;
    
    width: 100%;
    height: 100%;
  }

  #file-input {
    display: none;
  }

  #spinner {
    border-radius: 100%;
    padding: 1em;
    background-color: var(--light-bg);
    backdrop-filter: blur(3px);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;

    transition: opacity 200ms;
  }

  #spinner.hidden {
    opacity: 0;
  }

  #message {
    z-index: 10;
    color: rgb(238, 131, 131);
    text-align: center;
    top: 25%;
    position: relative;
  }
</style>