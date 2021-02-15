// constants
const dyeWt = 'GAAGGTGACCAAGTTCATGCT';
const dyeMt = 'GAAGGTCGGAGTCAACGGATT';
const reSnp = /([ATCG]+)\[([ATCG])\/?([ATCG])]([ATCG]+)/;

type Sequence = string; // type alias for strings that we know contain only ATCG

export const fromSeq = (sequence: string, name = 'SNP') => {
  const match = sequence.toUpperCase().match(reSnp);
  if (!match) return `${name} Invalid entry or base doesn't match`;
  const [, before, w, m, seqReverse] = match;
  const seqWt = before + w;
  const seqMt = before + m;
  const primerWt = findFoward(seqWt, dyeWt).primer;
  const primerMt = findFoward(seqMt, dyeMt).primer;
  if (!primerWt || !primerMt) return `${name} Failed`;
  // must reverse comp
  const primerCommon = reverseComplement(findReverse(seqReverse));
  return `x${name}\t${primerWt}
y${name}\t${primerMt}
c${name}\t${primerCommon}`;
};

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
const findFoward = (sequence: Sequence, dye: string) => {
  for (let seqLen = 18; seqLen < 40; seqLen++) {
    const primer = dye + sequence.slice(-seqLen);
    let { length, GC, altTm } = getTm(primer);
    if (altTm > 62) {
      return { primer, length, GC, altTm };
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
if (typeof require !== 'undefined' && require.main === module) {
  const [, , seq] = process.argv;
  if (!seq) {
    console.log('Provide a sequence in the form AAAGTTCTGGTGC[TG]GGATGAGGC');
  } else {
    console.log(fromSeq(seq));
  }
}
