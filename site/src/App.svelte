<script lang="ts">
  let snpList = `6 47916081 CG
6 48072811 CA MainSNP
8 12485673 AT OtherSNP`;

  let seqList =
    'Abcc6a GCTGGTATGCCTAGCAAGAGCTCTTCTCAGAAAGACAAAAGTTCTGGTGC[TG]GGATGAGGCAACAGCTGCACTGGACCTGGAGACAGACACGCTGATCCAGT';
</script>

<svelte:head><title>K designer</title></svelte:head>

<div class="block heading">
  <p>K primer designer</p>
  <div style="font-size: small">
    &copy; 2013-2018 Eirinn Mackay, Hubrecht Institute & University College
    London
  </div>
  <p style="font-size: small; font-weight: bold;">
    Updated 2018: now using danRer11
  </p>
</div>
<div class="block main">
  <p>
    Option 1: Provide a list of SNPs with chromosome, position, reference base
    and mutant base.
  </p>
  <p>
    A name can be provided (optional). The appropriate sequence will be taken
    from danRer11.
  </p>
  <form name="form1" method="post" action="genome">
    <p>
      <textarea name="list" bind:value={snpList} cols="72" rows="12" />
    </p>
    <input
      type="submit"
      name="submit"
      id="submit"
      value="Generate primers from genome"
    />
  </form>
</div>
<div class="block main">
  <p>
    Option 2: Provide a sequence with the mutation in the form [WM], where W is
    wildtype base and M is mutant.
  </p>
  <p>Include 50bp on either side of the mutation.</p>
  <p>
    For deletions, use the shortest common sequence and make M the first base
    after the deletion.
  </p>
  <form name="form2" method="post" action="sequence">
    <p>
      <textarea
        name="list"
        bind:value={seqList}
        cols="120"
        rows="12"
        style="font-size: 8pt"
      />
    </p>
    <input
      type="submit"
      name="submit"
      id="submitseq"
      value="Generate primers from sequence"
    />
  </form>
</div>

<style>
  :global(body) {
    font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
    font-size: 12pt;
    background-image: url(body-bg.jpg);
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
  .block.heading {
    font-size: 36pt;
    background-color: #bbcfff;
    margin-top: 30px;
  }
  p {
    margin: 0;
  }
  .block.main {
    background-color: #ccecff;
    margin-top: 8pt;
  }
  textarea {
    font-family: 'Courier New', Courier, monospace;
    width: 840px;
  }
</style>
