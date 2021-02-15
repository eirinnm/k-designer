# K-Designer 🐟

### A tool for designing genotyping primers.

## Usage

### Web interface (Requires Node.JS)

After cloning the repository, run the following to install dependencies and build the app:

```sh
npm install
npm run build
```

Then run `npm start` to launch the web server. Open a browser and connect to [localhost:5000](http://localhost:5000).

### Command line interface (Requires Python)

Run `getKasparV3.py <sequence>` where \<sequence\> is in the form AAAGTTCTGGTGC[TG]GGATGAGGC.

### Positional markers (no longer supported in Web UI!)

To use the tool's "option 1" which generates primers based on genome coordinates, a genome file must be provided. Currently this is hard-coded as `danRer11.2bit`. This file is 431mb and can be found [here](http://hgdownload.soe.ucsc.edu/gbdb/danRer11/). Download it and place it in the project's root directory.

The package [twobitreader](https://anaconda.org/bioconda/twobitreader) must also be installed using pip or conda.

## Development

### Get started

After installing dependencies with `npm install`, start the server in watch mode using [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see the app running. Make a change to `src/App.svelte`, save it, and the page should automatically reload showing your changes.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

### Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

### Deploying to the web

#### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name my-project
```

#### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
surge public my-project.surge.sh
```
