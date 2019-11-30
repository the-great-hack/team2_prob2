import 'regenerator-runtime/runtime';
import 'core-js/features/array/flat-map';

import fs from 'fs';
import cors from 'cors';
import path from 'path';
import express from 'express';
import Graph from 'src/algorithms/dijkstra';
import { calculateViscosity } from 'src/utils';

// load data from sources
import blocks from 'data/blocks.json';
import transports from 'data/transports.json';

const port = process.env.PORT || 3000;
const app = express();
app.disable('x-powered-by');
app.use(cors());

const graph = new Graph();
const flatBlocks = blocks.flatMap(b => b);

// transform data and feed it to the graph service
for (let i = 0, len = blocks[0].length; i < flatBlocks.length; i += 1) {
  const obj = {};

  if (flatBlocks[i + 1] && (i + 1) % len !== 0) {
    obj[flatBlocks[i + 1].name] = calculateViscosity(
      transports,
      flatBlocks[i].lanes,
      flatBlocks[i].stats.carCount,
      flatBlocks[i].stats.busAllowed
    );
  }

  if (flatBlocks[i + len]) {
    obj[flatBlocks[i + len].name] = calculateViscosity(
      transports,
      flatBlocks[i].lanes,
      flatBlocks[i].stats.carCount,
      flatBlocks[i].stats.busAllowed
    );
  }

  graph.addVertex(flatBlocks[i].name, obj);
}

const getShortestPath = async (start, end) =>
  graph.shortestPath(start, end).map(name => {
    const block = blocks.flatMap(b => b).find(b => b.name === name);
    let mode;

    for (let transport of transports) {
      if (transport[0] >= block.viscosity && block.viscosity < transport[1]) {
        mode = transport[3];
        break;
      }
    }

    if (!mode) {
      mode = transports[transports.length - 1][3];
    }

    return { name: block.name, mode };
  });

const getPathModes = async (start, end) => {
  const paths = await getShortestPath(start, end);
  const reducedPaths = paths.length
    ? [
        {
          src: paths[0].name,
          dest: paths[0].name,
          mode: paths[0].mode,
          routes: [paths[0].name],
          distance: 1,
        },
      ]
    : [];

  for (let i = 1; i < paths.length; i += 1) {
    if (reducedPaths[reducedPaths.length - 1].mode === paths[i].mode) {
      reducedPaths[reducedPaths.length - 1] = {
        ...reducedPaths[reducedPaths.length - 1],
        dest: paths[i].name,
        routes: [
          ...reducedPaths[reducedPaths.length - 1].routes,
          paths[i].name,
        ],
        distance: reducedPaths[reducedPaths.length - 1].distance + 1,
      };
    } else {
      reducedPaths.push({
        src: paths[i].name,
        dest: paths[i].name,
        mode: paths[i].mode,
        routes: [paths[i].name],
        distance: 1,
      });
    }
  }

  return reducedPaths;
};

app.get('/api/locations', (req, res) => res.send(flatBlocks.map(p => p.name)));

app.get('/api/rides', async (req, res) => {
  const { start, end } = req.query;

  if (start && end) {
    const startLocation = flatBlocks.find(p => p.name === start);
    const endLocation = flatBlocks.find(p => p.name === end);

    if (startLocation && endLocation) {
      const results = await getPathModes(start, end);
      res.send(results);
    } else {
      res
        .status(404)
        .type('txt')
        .send('Location does not exist');
    }
  } else {
    res
      .status(422)
      .type('txt')
      .send('Start and end location not provided');
  }
});

app.get('/', (req, res) => {
  const stream = fs.readFileSync(path.resolve(__dirname, 'web', 'index.html'));
  res.type('text/html').send(stream);
});

app.use((req, res) =>
  res
    .status(404)
    .type('txt')
    .send(`Cannot ${req.method} ${req.path}`)
);

const bootstrap = async () => {
  app.listen(port, () =>
    console.log(
      `🚀  Server running at http://localhost:${port} in "${process.env.NODE_ENV}" mode`
    )
  );
};

// start the app server
bootstrap();
