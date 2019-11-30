import 'core-js/features/array/flat-map';

import cors from 'cors';
import express from 'express';
import graph from 'src/algorithms/dijkstra';

import blocksData from 'data/blocks.json';
import transports from 'data/transports.json';

const app = express();
app.disable('x-powered-by');
app.use(cors());

const calculateViscosity = (lanes, carCount, busAllowed = true) => {
  let viscosity = 0;

  if (lanes === 1) {
    viscosity += 4;
  } else if (lanes > 1) {
    viscosity += 3;
  } else if (lanes > 2) {
    viscosity += 2;
  } else if (lanes > 3) {
    viscosity += 0;
  }

  if (carCount >= 0 && carCount < 1) {
    viscosity += 1;
  } else if (carCount >= 1 && carCount < 2) {
    viscosity += 2;
  } else if (carCount >= 2 && carCount < 3) {
    viscosity += 3;
  } else {
    viscosity += 4;
  }

  if (!busAllowed) {
    viscosity += transports[0][2];
  }

  return viscosity;
};

const blocks = blocksData.map(v1 =>
  v1.map(v2 => ({
    ...v2,
    viscosity: calculateViscosity(
      v2.stats.lanes,
      v2.stats.carCount,
      v2.stats.busAllowed
    ),
  }))
);

const g = new graph();

g.addVertex('A', { B: 1, F: 2 });
g.addVertex('B', { G: 3, C: 1 });
g.addVertex('C', { H: 5, D: 9 });
g.addVertex('D', { I: 8, E: 3 });
g.addVertex('E', { I: 2 });
g.addVertex('F', { G: 1, K: 4 });
g.addVertex('G', { H: 6, L: 5 });
g.addVertex('H', { I: 7, M: 9 });
g.addVertex('I', { J: 4, N: 2 });
g.addVertex('J', { O: 5 });
g.addVertex('K', { L: 2 }, { P: 5 });
g.addVertex('L', { Q: 7 }, { M: 3 });
g.addVertex('M', { N: 5 }, { R: 9 });
g.addVertex('N', { S: 1 }, { O: 8 });
g.addVertex('O', { T: 8 });
g.addVertex('P', { Q: 1 }, { U: 5 });
g.addVertex('Q', { R: 6 }, { V: 2 });
g.addVertex('R', { S: 4 }, { W: 3 });
g.addVertex('S', { T: 4 }, { X: 2 });
g.addVertex('T', { Y: 2 });
g.addVertex('U', {});
g.addVertex('V', {});
g.addVertex('W', {});
g.addVertex('X', {});
g.addVertex('Y', {});

const getPaths = (start, end) => {
  const paths = g.shortestPath(start, end).map(name => {
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
