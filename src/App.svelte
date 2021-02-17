<script lang="ts">
import { from2seqs } from './getKasparV3';
  let name = 'SNP';
  let seqList =
    'Abcc6a GCTGGTATGCCTAGCAAGAGCTCTTCTCAGAAAGACAAAAGTTCTGGTGC[TG]GGATGAGGCAACAGCTGCACTGGACCTGGAGACAGACACGCTGATCCAGT';
  let wtSeq = 
    'GCTGGTATGCCTAGCAAGAGCTCTTCTCAGAAAGACAAAAGTTCTGGTGCTGGATGAGGCAACAGCTGCACTGGACCTGGAGACAGACACGCTGATCCAGT';
  let mtSeq = 
    'GCTGGTATGCCTAGCAAGAGCTCTTCTCAGAAAGACAAAAGTTCTGGTGC--GGGATGAGGCAACAGCTGCACTGGACCTGGAGACAGACACGCTGATCCAGT';

  let report: ReturnType<typeof from2seqs>; 
  let reverse_report: ReturnType<typeof from2seqs>;
  let error: undefined | Error;
  $: {
    try {
      report = from2seqs(wtSeq, mtSeq, name, false);
      reverse_report = from2seqs(wtSeq, mtSeq, name, true);
      error = undefined; //reset error on success
    } catch (e) {
      error = e;
    }
  }
</script>

<svelte:head><title>K designer</title></svelte:head>

<div class="block heading">
  <p>K primer designer</p>
  <div style="font-size: small">
    &copy; 2013-2021 Eirinn Mackay, Hubrecht Institute & University College
    London.
    Source available on <a href="https://github.com/zouden/k-designer">Github</a>.
  </div>
  <p style="font-size: small; font-weight: bold;">
    Updated 2021: rewritten in JS using Svelte. Thanks to David Rolle (@miridius).
  </p>
</div>

<div class="block main">
  <p>
    Provide the wildtype and mutant sequences below.
    Include at least 50bp on either side of the target mutation.<br>
    The sequences do not need to be equal length.
    A basic alignment of the start positions will be performed.<br>
    A dash (-) can be used to indicate deletions as it will be skipped when generating primers.
  </p><br>
  <p>
    <label for="seqName">Name (optional):</label>
    <input type="text" 
    id="seqName" 
    style="font: 8pt monospace"
    bind:value={name}/><br>
    <label for="wtSeq">Wildtype sequence:</label>
    <input 
      type="text" 
      size=120 
      id="wtSeq"
      style="font: 8pt monospace"
      bind:value={wtSeq}
      /><br>
      <label for="mtSeq">Mutant sequence:</label>
      <input 
      type="text" 
      size=120 
      id="mtSeq"
      style="font: 8pt monospace"
      bind:value={mtSeq}
    /><br>

      

  </p>
</div>
{#if error}
  <div class="block main sequence">{error}</div>
{:else}
  {#if report}
  <div class="block heading">Forward orientation</div>
  <div class="block main sequence">
    <p>Input sequences:</p>
    <p>
      W/t: {@html report.wtFormatted}<br>
      Mut: {@html report.mtFormatted}
    </p><br><p>Primers (including 5' tags):</p>
    <p>
      x{name} {@html report.primersHTML.wt}<br/>
      y{name} {@html report.primersHTML.mt}<br/>
      c{name} {@html report.primersHTML.com}<br/>
    </p>
  </div>
  {/if}

  {#if reverse_report}
    <div class="block heading">Reverse orientation (alternative primers)</div>
    <div class="block main sequence">
      <p>Input sequences:</p>
      <p>
        W/t: {@html reverse_report.wtFormatted}<br>
        Mut: {@html reverse_report.mtFormatted}
      </p><br><p>Primers (including 5' tags):</p>
      <p>
        x{name}_alt {@html reverse_report.primersHTML.wt}<br/>
        y{name}_alt {@html reverse_report.primersHTML.mt}<br/>
        c{name}_alt {@html reverse_report.primersHTML.com}<br/>
      </p>

    </div>
  {/if}
{/if}
<style>
  :global(body) {
    font-family: 'Open Sans', Arial, Helvetica, sans-serif;
    font-size: 12pt;
    background-image: url(/body-bg.jpg);
    background-repeat: repeat;
  }
  :global(span.target1) { background: rgb(130, 253, 72);}
  :global(span.target2) { background: rgb(0, 255, 242);}
  :global(span.target3) { background: rgb(223, 208, 6);}
  :global(span.snp) { background: rgb(255, 159, 104);}
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
  .block.heading {
    font-size: 30pt;
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
  .sequence {
    font: 8pt monospace;
  }
</style>
