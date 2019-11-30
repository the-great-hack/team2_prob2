import 'regenerator-runtime/runtime';
import 'core-js/features/array/flat-map';

import fs from 'fs';
import cors from 'cors';
import path from 'path';
import express from 'express';
import Graph from 'src/algorithms/dijkstra';
import { calculateViscosity } from 'src/utils';

import blocksData from 'data/blocks.json';
import transports from 'data/transports.json';

const port = process.env.PORT || 3000;
const app = express();
app.disable('x-powered-by');
app.use(cors());

// load data from source
const blocks = blocksData.map(val1 =>
  val1.map(val2 => ({
    ...val2,
    viscosity: calculateViscosity(
      transports,
      val2.stats.lanes,
      val2.stats.carCount,
      val2.stats.busAllowed
    ),
  }))
);

const graph = new Graph();
graph.addVertex('A', { B: 1, F: 2 });
graph.addVertex('B', { G: 3, C: 1 });
graph.addVertex('C', { H: 5, D: 9 });
graph.addVertex('D', { I: 8, E: 3 });
graph.addVertex('E', { I: 2 });
graph.addVertex('F', { G: 1, K: 4 });
graph.addVertex('G', { H: 6, L: 5 });
graph.addVertex('H', { I: 7, M: 9 });
graph.addVertex('I', { J: 4, N: 2 });
graph.addVertex('J', { O: 5 });
graph.addVertex('K', { L: 2 }, { P: 5 });
graph.addVertex('L', { Q: 7 }, { M: 3 });
graph.addVertex('M', { N: 5 }, { R: 9 });
graph.addVertex('N', { S: 1 }, { O: 8 });
graph.addVertex('O', { T: 8 });
graph.addVertex('P', { Q: 1 }, { U: 5 });
graph.addVertex('Q', { R: 6 }, { V: 2 });
graph.addVertex('R', { S: 4 }, { W: 3 });
graph.addVertex('S', { T: 4 }, { X: 2 });
graph.addVertex('T', { Y: 2 });
graph.addVertex('U', { V: 4 });
graph.addVertex('V', { W: 5 });
graph.addVertex('W', { X: 3 });
graph.addVertex('X', { Y: 2 });
graph.addVertex('Y', {});

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

app.get('/api/locations', (req, res) =>
  res.send(blocks.flatMap(p => p).map(p => p.name))
);

app.get('/api/rides', async (req, res) => {
  const { start, end } = req.query;

  if (start && end) {
    const startLocation = blocks.flatMap(p => p).find(p => p.name === start);
    const endLocation = blocks.flatMap(p => p).find(p => p.name === end);

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
