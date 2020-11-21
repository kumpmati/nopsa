<script>
  export let submit;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let files = null;

  // reset file input
  const clear = () => {
    document.querySelector("#file-input").value = null; // resets file input element
    files = null; // resets file list
    dispatch("clear");
  }
</script>

<span>
  <h2>Open transcript</h2>
  <input
    id="file-input"
    type="file"
    accept=".pdf"
    bind:files
    on:change={() => submit(files && files[0])}
  />
  {#if files && files.length > 0}
    <input type="submit" value="Clear" on:click={clear} />
  {/if}
</span>