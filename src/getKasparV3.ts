// constants
const dyeWt = 'GAAGGTGACCAAGTTCATGCT';
const dyeMt = 'GAAGGTCGGAGTCAACGGATT';
const reSnp = /([ATCG]+)\[([ATCG])\/?([ATCG])]([ATCG]+)/;

type Sequence = string; // type alias for strings that we know contain only ATCG

// export const fromSeq = (sequence: string, name = 'SNP') => {
//   const match = sequence.toUpperCase().match(reSnp);
//   if (!match) return `${name} Invalid entry or base doesn't match`;
//   const [, before, w, m, seqReverse] = match;
//   const seqWt = before + w;
//   const seqMt = before + m;
//   const primerWt = findForward(seqWt, dyeWt).primer;
//   const primerMt = findForward(seqMt, dyeMt).primer;
//   if (!primerWt || !primerMt) return `${name} Failed`;
//   // must reverse comp
//   const primerCommon = reverseComplement(findReverse(seqReverse));
//   return `x${name}\t${primerWt}
//   y${name}\t${primerMt}
//   c${name}\t${primerCommon}`;
// };

export const from2seqs = (wtSeq: string, mtSeq: string, name = 'SNP', revComp = false) => {
  wtSeq = wtSeq.replaceAll('-', '').toUpperCase();
  mtSeq = mtSeq.replaceAll('-', '').toUpperCase();
  if(revComp) {
    wtSeq = reverseComplement(wtSeq);
    mtSeq = reverseComplement(mtSeq);
  }
  let [seqWt, seqMt] = findCommonStart(wtSeq, mtSeq);
  // search for primers in these targets
  const primerWt = findForward(seqWt, dyeWt);
  const primerMt = findForward(seqMt, dyeMt);
  if (primerWt.primer && primerMt.primer) {
    // find the reverse primer
    // cut off the forward section to ensure the primers don't overlap.
    let seqReverse = findCommonEnd(wtSeq.replace(seqWt,''), mtSeq.replace(seqMt,''));
    const revPrimer = findReverse(seqReverse);
    // now prepare a formatted report
    // find the target and apply a style
    
    let wtFormatted = wtSeq.replace(primerWt.target,
                                "<span class='target1'>" + 
                                insertAtPos(primerWt.target, "<span class='snp'>", -1) +
                                "</span></span>");
    let mtFormatted = mtSeq.replace(primerMt.target,
                                "<span class='target2'>" + 
                                insertAtPos(primerMt.target, "<span class='snp'>", -1) +
                                "</span></span>");
    // format the common primer
    wtFormatted = wtFormatted.replace(revPrimer,"<span class='target3'>$&</span>");
    mtFormatted = mtFormatted.replace(revPrimer,"<span class='target3'>$&</span>");
    // must reverse complement the common primer
    const primerCommon = reverseComplement(revPrimer);
    let primersHTML = {
      wt: dyeWt + "<span class='target1'>" +
        insertAtPos(primerWt.target, "<span class='snp'>", -1) +
        "</span></span>",
      mt: dyeMt + "<span class='target2'>" +
        insertAtPos(primerMt.target, "<span class='snp'>", -1) +
        "</span></span>",
      com: "<span class='target3'>" + primerCommon + "</span>"
    }
    return {
      wtFormatted,
      mtFormatted,
      primersHTML,
      primers : {
        wt: primerWt.primer,
        mt: primerMt.primer,
        com: primerCommon
      },
      name
    }
  }else{
    return undefined;
  }

}

const insertAtPos = (str: string, substr: string, pos: number) => {
  return str.slice(0, pos) + substr + str.slice(pos)
}

const findCommonStart = (str1: string, str2: string) => {
  // iterate through the strings until finding the first mismatch.
  // first find an 8-mer that is common in both strings.
  let start1 = 0;
  let start2 = str2.indexOf(str1.slice(start1,8));
  if(start2==-1) {
    // the start of str1 was not found in str2. Try the reverse
    start2 = 0;
    start1 = str1.indexOf(str2.slice(start2, 8));
  }
  if(start1 == -1)
    throw new Error(`Could not identify common sequence`);
  let i = 0;
  while (str1.charAt(start1+i) == str2.charAt(start2+i)){
    i++; 
    if (i==str1.length || i==str2.length)
      throw new Error(`No mutation found!`);
  }
  i++; //increment to the next base, the mismatched base
  return [
    str1.substr(start1, i), str2.substr(start2, i)
    // start1, start2, i
  ]
}

const findCommonEnd = (str1: string, str2: string) => {
  // iterate through the strings until finding the last mismatch.
  // first find an 8-mer that is common in both strings.
  let start1 = str1.length-8;
  let start2 = str2.lastIndexOf(str1.substr(start1,8));
  if(start2==-1) {
    // the end of str1 was not found in str2. Try the reverse
    start2 = str2.length-8;
    start1 = str1.lastIndexOf(str2.substr(start2, 8));
  }
  if(start1 == -1)
    throw new Error(`Could not align 3' ends. At least 8 matching bases is required.`);
  let i = 0;
  // if(str1 != str2){
    while (str1.charAt(start1+i) == str2.charAt(start2+i)){
      i--; //increment backwards
      // console.log(start1, i, str1.charAt(start1+i));
      if (i == 8-str1.length || i == 8-str2.length)
        break;
    }
    i++; //increment forwards because we don't want a mismatched base
  // }else{
    // i=-start1; //the sequences match so we can take the whole thing
  // }
  if (str1.slice(start1 + i, start1 + 8) == str2.slice(start2 + i, start2 + 8)){
    return str1.slice(start1 + i, start1 + 8)
  } else {
    throw new Error(`3' sequences don't match`);
    return "";
  }

}

/**
 * A JS implementation of python's string.count() method
 *
 * This could be done more easily using str.split() + reduce or str.match(), but
 * this way is more performant
 * @param str string to search
 * @param char character to search for
 */
const count = (str: string, char: string) => {
  if (char.length != 1) {
    throw new Error(`char '${char}' must be a single character`);
  }
  let count = 0;
  let i = str.indexOf(char);
  while (i >= 0) {
    count++;
    i = str.indexOf(char, i + 1);
  }
  return count;
};

/** Calculate stats for an oligo  */
const getTm = (oligo: Sequence) => {
  const length = oligo.length;
  const GC = (count(oligo, 'G') + count(oligo, 'C')) / length;
  const Na = 50;
  // commenting out since it's never used (this is the incorrect Kbio one)
  // const Tm = 100.5 + 0.41 * GC - 820 / length + 7.21 * Math.log(Na / 1000.0);
  // a much better formula
  const altTm =
    81.5 +
    16.6 * (Math.log(Na / 1000.0) / Math.log(10)) +
    41 * GC -
    675 / length;
  return { length, GC, altTm };
};

/**
 * Finds a primer that runs right up to the last base of this sequence.
 * It aims for an altTm of 50, and max length of 39
 */
const findForward = (sequence: Sequence, dye: string) => {
  for (let seqLen = 18; seqLen < 40; seqLen++) {
    const target = sequence.slice(-seqLen);
    const primer = dye + target;
    let { length, GC, altTm } = getTm(primer);
    if (altTm > 62) {
      return { primer, length, GC, altTm, target };
    }
  }
  return {};
};

const weighReverse = (oligo: Sequence) => {
  // apply some penalties
  const minTm = 54; // every degree under will be penalised
  const penaltyTm = 10;
  const optLength = 20;
  const penaltyLength = 2; // every base longer will be penalised
  const penaltyLackOfAT = 50; // for every base in the first 2 that's not an AT
  const firstbases = oligo.slice(0, 2);
  const numATs = firstbases.match(/[AT]/g)?.length || 0;
  let weight = (2 - numATs) * penaltyLackOfAT;
  const { altTm } = getTm(oligo);
  weight = weight + penaltyTm * Math.max(minTm - altTm, 0);
  weight = weight + penaltyLength * Math.max(oligo.length - optLength, 0);
  return weight;
};

const findReverse = (sequence: Sequence) => {
  // sequence is provided in the forward strand
  // primer will be matched to the forward strand
  // it will then have to be reverse - complemented
  const minGap = 2; // bases from the snp
  const penaltyGap = 2; // every base away from the minimum will be penalised
  const minLength = 18;
  const maxLength = 30;
  let minWeight = Infinity; // set a high starting value
  let bestOligo = '';
  for (
    let startPos = minGap;
    startPos < sequence.length - minLength;
    startPos++
  ) {
    const startWeight = startPos * penaltyGap;
    // test every oligo at this starting point
    for (let length = minLength; length < maxLength; length++) {
      const oligo = sequence.substr(startPos, length);
      const thisWeight = startWeight + weighReverse(oligo);
      if (thisWeight <= minWeight) {
        minWeight = thisWeight;
        bestOligo = oligo;
      }
    }
  }
  return bestOligo;
};

const reverseComplement = (sequence: Sequence) =>
  sequence
    .split('')
    .map((c) => ({ A: 'T', T: 'A', C: 'G', G: 'C' }[c]))
    .reverse()
    .join('');

// running in nodeJS and as the main script (not imported via require)
// if (typeof require !== 'undefined' && require.main === module) {
//   const [, , seq] = process.argv;
//   if (!seq) {
//     console.log('Provide a sequence in the form AAAGTTCTGGTGC[TG]GGATGAGGC');
//   } else {
//     console.log(fromSeq(seq));
//   }
// }
