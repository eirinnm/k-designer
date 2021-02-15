<script lang="ts">
  import { fromSeq } from './getKasparV3';

  let seqList =
    'Abcc6a GCTGGTATGCCTAGCAAGAGCTCTTCTCAGAAAGACAAAAGTTCTGGTGC[TG]GGATGAGGCAACAGCTGCACTGGACCTGGAGACAGACACGCTGATCCAGT';

  $: report = seqList
    .split('\n')
    .map((s) => s.split(/\s+/))
    .map(([arg1, arg2]) => (arg2 ? { name: arg1, seq: arg2 } : { seq: arg1 }))
    .filter(({ seq }) => seq?.length > 50)
    .map(({ seq, name }) => fromSeq(seq, name))
    .join('\n');
</script>

<svelte:head><title>K designer</title></svelte:head>

<div class="block heading">
  <p>K primer designer</p>
  <div style="font-size: small">
    &copy; 2013-2021 Eirinn Mackay, Hubrecht Institute & University College
    London
  </div>
  <p style="font-size: small; font-weight: bold;">
    Updated 2021: rewritten in JS, but no longer supports danRer11
  </p>
</div>

<div class="block main">
  <p>
    Provide a sequence with the mutation in the form [WM], where W is wildtype
    base and M is mutant.
  </p>
  <p>Include 50bp on either side of the mutation.</p>
  <p>
    For deletions, use the shortest common sequence and make M the first base
    after the deletion.
  </p>
  <p>
    <textarea
      bind:value={seqList}
      cols="120"
      rows="12"
      style="font-size: 8pt"
    />
  </p>
</div>

{#if report}
  <div class="block heading small">Your primers are:</div>
  <div class="block main small">
    <pre>{report}</pre>
  </div>
{/if}

<style>
  :global(body) {
    font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
    font-size: 12pt;
    background-image: url(/body-bg.jpg);
    background-repeat: repeat;
  }
  .block {
    width: 850px;
    margin: 4pt;
    margin-left: 20px;
    padding: 5px;
    border-top-width: thin;
    border-right-width: thin;
    border-bottom-width: thin;
    border-left-width: thin;
    border-top-style: solid;
    border-right-style: solid;
    border-bottom-style: solid;
    border-left-style: solid;
  }
  .block.small {
    width: 650px;
  }
  .block.heading {
    font-size: 36pt;
    background-color: #bbcfff;
    margin-top: 30px;
  }
  .block.main {
    background-color: #ccecff;
    margin-top: 8pt;
  }
  p {
    margin: 0;
  }
  textarea {
    font-family: 'Courier New', Courier, monospace;
    width: 840px;
  }
  pre {
    font-size: 10pt;
  }
</style>
