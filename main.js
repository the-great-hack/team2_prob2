import 'core-js/features/array/flat-map';

import cors from 'cors';
import express from 'express';
import Graph from 'src/algorithms/dijkstra';
import { calculateViscosity } from 'src/utils';

import blocksData from 'data/blocks.json';
import transports from 'data/transports.json';

const app = express();
app.disable('x-powered-by');
app.use(cors());

const blocks = blocksData.map(v1 =>
  v1.map(v2 => ({
    ...v2,
    viscosity: calculateViscosity(
      transports,
      v2.stats.lanes,
      v2.stats.carCount,
      v2.stats.busAllowed
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
graph.addVertex('U', {});
graph.addVertex('V', {});
graph.addVertex('W', {});
graph.addVertex('X', {});
graph.addVertex('Y', {});

const getPaths = (start, end) => {
  const paths = graph.shortestPath(start, end).map(name => {
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

  let reducedPaths = paths.length
    ? [
        {
          src: paths[0].name,
          dest: paths[0].name,
          mode: paths[0].mode,
        },
      ]
    : [];

  for (let i = 1; i < paths.length; i += 1) {
    if (paths[i].mode !== reducedPaths[reducedPaths.length - 1].mode) {
      reducedPaths = [
        ...reducedPaths,
        {
          src: paths[i].name,
          dest: paths[i].name,
          mode: paths[i].mode,
        },
      ];
    } else if (
      (paths[i + 1] && paths[i].mode !== paths[i + 1].mode) ||
      !paths[i + 1]
    ) {
      reducedPaths[reducedPaths.length - 1] = {
        ...reducedPaths[reducedPaths.length - 1],
        dest: paths[i].name,
      };
    }
  }

  return reducedPaths;
};

app.get('/api/locations', (req, res) =>
  res.send(blocks.flatMap(p => p).map(p => p.name))
);

app.get('/api/paths', (req, res) => {
  const { start, end } = req.query;

  if (start && end) {
    const startLocation = blocks.flatMap(p => p).find(p => p.name === start);
    const endLocation = blocks.flatMap(p => p).find(p => p.name === end);

    if (startLocation && endLocation) {
      res.send(getPaths(start, end));
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

app.use((req, res) =>
  res
    .status(404)
    .type('txt')
    .send(`Cannot ${req.method} ${req.path}`)
);

app.listen(3000, () =>
  console.log(
    `server running at http://localhost:3000 in "${process.env.NODE_ENV}" mode`
  )
);
