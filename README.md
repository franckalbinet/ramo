# RAMO
> RAdiation MOnitoring

This is a simple prototype showing how to perform dynamic spatial aggregation using the [H3 library](https://h3geo.org) in combination with [MapboxGL](https://docs.mapbox.com/mapbox-gl-js).

Such visualization technique is one way to address the classical [overplotting issue](https://r-graphics.org/recipe-scatter-overplot) and is particularly relevant when it comes to visualizing monitored radiation level in the environment.

You can access a live demo. at the following url: http://fr.anckalbi.net/ramo


The [Svelte JavaScript framework](https://svelte.dev) is used in the current prototyped implementation but further version will use [SvelteKit](https://kit.svelte.dev).

Data source: [SIMULATED DATA - ConvEx-3 (2021)](https://www.iaea.org/newscenter/pressreleases/major-iaea-international-nuclear-emergency-exercise-concludes-after-36-hours)


## Get started

Install the dependencies...

```bash
cd ramo
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Musical reference
Rameau (pronounced Ram[o] in French): https://www.youtube.com/watch?v=2sPC8HsXxik


