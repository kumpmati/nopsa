<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  let version = null;
  let message = null;
  let action = () => null;


  const dismiss = () => {
    message = null;
    action = () => null;
  }

  const setupListener = () => {
    if (!"serviceWorker" in navigator) return;
    
    navigator.serviceWorker
      .addEventListener("message", (e) => {
        switch(e.data.action) {
          case "update":
            message = e.data;

            action = async () => { // tells service worker to clear cache and re-download all assets
              const sw = await navigator.serviceWorker.ready;
              sw.active.postMessage({ action: "update" });
            };
            break;

          case "refresh":
            location.reload();
            break;
        }
      });
  };

  onMount(async () => {
    const manifest = await fetch('manifest.json');
    version = (await manifest.json()).version;
  });
</script>

<svelte:window on:load={setupListener} />

<p id="version">{version}</p>
{#if message}
  <div id="message" transition:fly|local={{ y: -10 }}>
    <div id="details">
      <h1>{message.message}</h1>
      <p>{message.detail}</p>
    </div>
    <div id="buttons">
      <input type="submit" on:click={action} value="OK" />
      <input type="submit" on:click={dismiss} value="X" />
    </div>
  </div>
{/if}

<style>
  #message {
    overflow-x: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;

    z-index: 100;

    margin: 0 auto;
    padding: .75em;
    left: 0;
    top: 0;

    border-bottom-left-radius: .25em;
    border-bottom-right-radius: .25em;

    width: 100vw;
    max-width: 40em;
    min-width: 15em;
    min-height: 4em;
    
    color: white;
    background-color: var(--title-col);

  }

  #details {
    display: flex;
    align-items: center;
  }

  #details > * {
    margin-right: .5em;
  }

  #buttons {
    display: flex;
  }

  input {
    color: white;
  }

  #version {
    position: fixed;
    font-size: .75rem;
    bottom: .5em;
    right: .5em;
    z-index: 5;
    color: var(--text-col);
  }
</style>