from math import log
import re
import twobitreader
import sys
import os
import locale

# constants
dyeWt = 'GAAGGTGACCAAGTTCATGCT'
dyeMt = 'GAAGGTCGGAGTCAACGGATT'
re_snp = re.compile(r'([ATCG]+)\[([ATCG])/?([ATCG])]([ATCG]+)')


class from_seq(object):
    def __init__(self, sequence, name='SNP'):
        # requires a sequence with a [AT] style SNP in it
        # assumes first version is wt, second is mut
        self.name = name
        self.status = 'Unknown'
        parts = re_snp.findall(sequence.upper())
        if parts:
            parts = parts[0]
            seqWt = parts[0]+parts[1]
            seqMt = parts[0]+parts[2]
            seqReverse = parts[3]
            self.primerWt = findFoward(seqWt, dyeWt)[0]
            self.primerMt = findFoward(seqMt, dyeMt)[0]
            if self.primerWt and self.primerMt:
                self.primerCommon = reverseComplement(
                    findReverse(seqReverse))  # must reverse comp
                self.status = 'Good'
            else:
                self.status = 'Failed'
        else:
            self.status = "Invalid entry or base doesn't match"

    def __repr__(self):
        return self.name+' '+self.status

    def get_primers(self):
        if self.status == 'Good':
            template = 'x{0.name}\t{0.primerWt}\n' +\
                'y{0.name}\t{0.primerMt}\n' +\
                'c{0.name}\t{0.primerCommon}'
            return template.format(self, length=[len(self.primerWt), len(self.primerMt), len(self.primerCommon)])
        else:
            return self.__repr__()


def from_position(chromosome, position, basechange, name=None):
    ''' Returns a SNP object from a position in the genome '''
    genome = twobitreader.TwoBitFile('danRer11.2bit')
    # since we expect 1-based position but the 2bit file uses 0-base
    position = int(position)-1
    cstring = 'chr'+str(chromosome)
    flanksize = 50
    flankseq = genome[cstring][position-flanksize:position+flanksize]
    upstream = flankseq[:flanksize]
    downstream = flankseq[flanksize+1:]
    refbase = flankseq[flanksize]
    if not name:
        name = '{c}.{pos:n}'.format(
            c=chromosome, pos=position).replace(',', '.')
    if basechange[0].lower() == refbase.lower():
        return from_seq('{0}[{1}]{2}'.format(upstream, basechange, downstream), name)
    else:
        return from_seq('', name)


def disambiguation(ref, alt):
    codes = dict(Y=set('CT'), R=set('AG'), W=set('AT'),
                 S=set('GC'), K=set('TG'), M=set('CA'))
    if alt in codes:
        if ref in codes[alt]:
            return ''.join(codes[alt]-set(ref))
        else:
            raise TypeError('Trinucleotide SNP!')
    else:
        return alt

# functions for finding primers


def reverseComplement(sequence):
    complement = str.maketrans('ATCGN', 'TAGCN')
    return sequence.translate(complement)[::-1]


def getTm(oligo):
    ''' Calculate stats for an oligo '''
    letters = dict([(base, oligo.count(base)) for base in 'ATCG'])
    length = sum(letters.values())
    GC = 1.0*(letters['C']+letters['G'])/length
    Na = 50
    Tm = 100.5 + (0.41 * GC) - (820/(length)) + 7.21 * \
        log(Na/1000.0)  # this is the incorrect Kbio one
    altTm = 81.5+16.6*log(Na/1000.0, 10)+41*GC-675 / \
        length  # a much better formula
    return length, GC, Tm, altTm


def findFoward(sequence, dye):
    ''' Finds a primer that runs right up to the last base of this sequence.
    It aims for an altTm of 50, and max length of 39
    '''
    altTm = 0
    length = 0
    primer = None
    for length in range(18, 40):
        candidate = dye+sequence[-length:]
        length, GC, Tm, altTm = getTm(candidate)
        if altTm > 62:
            primer = candidate
            break
    return primer, length, GC, altTm


def weighReverse(oligo):
    # apply some penalties
    minTm = 54  # every degree under will be penalised
    penaltyTm = 10
    optLength = 20
    penaltyLength = 2  # every base longer will be penalised
    penaltyLackOfAT = 50  # for every base in the first 2 that's not an AT
    firstbases = oligo[:2]
    numATs = firstbases.count('A')+firstbases.count('T')
    weight = (2-numATs)*penaltyLackOfAT
    tm = getTm(oligo)[3]  # using altTm
    weight = weight+penaltyTm*max(minTm-tm, 0)
    weight = weight+penaltyLength*max(len(oligo)-optLength, 0)
    return weight


def findReverse(sequence):
    # sequence is provided in the forward strand
    # primer will be matched to the forward strand
    # it will then have to be reverse-complemented
    minGap = 2  # bases from the snp
    penaltyGap = 2  # every base away from the minimum will be penalised
    minLength = 18
    maxLength = 30
    # okay let's try this
    minOverallWeight = 10000  # set a high starting value
    for startPos in range(minGap, len(sequence)-minLength):
        minWeight = 10000  # set a high starting value
        startWeight = startPos*penaltyGap
        # test every oligo at this starting point
        for length in range(minLength, maxLength):
            oligo = sequence[startPos:startPos+length]
            thisWeight = startWeight+weighReverse(oligo)
            if thisWeight <= minWeight:
                minWeight = thisWeight
                bestOligo = oligo
        # print startPos, minWeight, bestOligo
        if minWeight <= minOverallWeight:
            minOverallWeight = minWeight
            bestOverallOligo = bestOligo
    # print minOverallWeight
    return bestOverallOligo


if __name__ == "__main__":
    if(len(sys.argv) < 2):
        print("Provide a sequence in the form AAAGTTCTGGTGC[TG]GGATGAGGC")
    else:
        seq = sys.argv[1]
        snp = from_seq(seq)
        print(snp.get_primers())
