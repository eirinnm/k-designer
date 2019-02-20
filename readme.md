# K-Designer 🐟

### A tool for designing genotyping primers.

## Usage

### Web interface 
After cloning the repository, run `kaspdesigner.py` to launch the web server. Open a browser and connect to localhost:8000.

### Command line interface
Run `getKasparV3.py <sequence>` where \<sequence\> is in the form AAAGTTCTGGTGC[TG]GGATGAGGC.

### Positional markers

To use the tool's "option 1" which generates primers based on genome coordinates, a genome file must be provided. Currently this is hard-coded as `danRer11.2bit`. This file is 431mb and can be found [here](http://hgdownload.soe.ucsc.edu/gbdb/danRer11/). Download it and place it in the project's root directory.

The package [twobitreader](https://anaconda.org/bioconda/twobitreader) must also be installed using pip or conda.

