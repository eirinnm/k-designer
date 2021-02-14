// TODO: placeholders until we recreate getKasparV3;
const fromPosition = (...args: any[]) => ({ getPrimers: () => args });
const fromSeq = fromPosition;

export const fromGenome = (list: string) =>
  list
    .split('\n')
    .map((s) => s.trim().match(/(\d+)\s(\d+)\s(\w\w)\s?(\w+)?/))
    .filter((s) => s)
    .map((match) => fromPosition(...match).getPrimers());

export const fromSequence = (list: string) =>
  list
    .split('\n')
    .map((s) => s.split(/\s+/))
    .map(([first, second]) => (second ? [first, second] : ['SNP', first]))
    .filter(([, seq]) => seq?.length > 50)
    .map(([name, seq]) => fromSeq(name, seq).getPrimers());
