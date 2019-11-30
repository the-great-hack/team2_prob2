import cors from 'cors';
import express from 'express';
import graph from 'node-dijkstra';

import Dijkstra from './src/algorithms/graphs/dijkstra';
import Graph from './src/data-structures/graph';
import Vertex from './src/data-structures/graph/vertex';
import Edge from './src/data-structures/graph/edge';

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
    viscosity += 1;
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

// for (let i = 0; i < blocks.length; i++) {
//   for (const j in blocks[i]) {
//     let obj = {};

//     if (blocks[i + 1] && blocks[i + 1][j]) {
//       obj[blocks[i + 1][j].name] = blocks[i][j].viscosity;
//     }

//     if (blocks[i][j + 1]) {
//       obj[blocks[i][j + 1].name] = blocks[i][j + 1].viscosity;
//     }

//     g1.addVertex(blocks[i][j].name, obj);
//   }
// }

// const g = new Graph();

// const startVertex = new Vertex('A');
// const vertexB = new Vertex('B');
// const vertexC = new Vertex('C');
// const vertexD = new Vertex('D');
// const vertexE = new Vertex('E');
// const vertexF = new Vertex('F');
// const vertexG = new Vertex('G');
// const vertexH = new Vertex('H');
// const vertexI = new Vertex('I');
// const vertexJ = new Vertex('J');
// const vertexK = new Vertex('K');
// const vertexL = new Vertex('L');
// const vertexM = new Vertex('M');
// const vertexN = new Vertex('N');
// const vertexO = new Vertex('O');
// const vertexP = new Vertex('P');
// const vertexQ = new Vertex('Q');
// const vertexR = new Vertex('R');
// const vertexS = new Vertex('S');
// const vertexT = new Vertex('T');
// const vertexU = new Vertex('U');
// const vertexV = new Vertex('V');
// const vertexW = new Vertex('W');
// const vertexX = new Vertex('X');
// const vertexY = new Vertex('Y');
// g.addEdge(new Edge(startVertex, vertexB, 10));
// g.addEdge(new Edge(startVertex, vertexF, 10));
// g.addEdge(new Edge(vertexB, vertexC, 10));
// g.addEdge(new Edge(vertexB, vertexG, 10));
// g.addEdge(new Edge(vertexC, vertexD, 10));
// g.addEdge(new Edge(vertexC, vertexH, 10));
// g.addEdge(new Edge(vertexD, vertexE, 10));
// g.addEdge(new Edge(vertexD, vertexI, 10));
// g.addEdge(new Edge(vertexE, vertexJ, 10));
// g.addEdge(new Edge(vertexF, vertexG, 10));
// g.addEdge(new Edge(vertexF, vertexK, 10));
// g.addEdge(new Edge(vertexG, vertexH, 10));
// g.addEdge(new Edge(vertexG, vertexL, 10));
// g.addEdge(new Edge(vertexH, vertexI, 10));
// g.addEdge(new Edge(vertexH, vertexM, 10));
// g.addEdge(new Edge(vertexI, vertexJ, 10));
// g.addEdge(new Edge(vertexI, vertexN, 10));
// g.addEdge(new Edge(vertexJ, vertexO, 10));

const addEdge = (start, end, weight) => {
  const srcVertex = g.getVertexByKey(start) || new Vertex(start);
  const destVertex = g.getVertexByKey(end) || new Vertex(end);

  console.log(start, ' -> ', end, `(${weight})`);

  g.addEdge(new Edge(srcVertex, destVertex, weight));
};

// for (let i = 0; i < blocks.length; i++) {
//   for (const j in blocks[i]) {
//     try {
//       if (i === 0 && j === 0) {
//         if (blocks[i + 1][j]) {
//           g.addEdge(
//             new Edge(
//               startVertex,
//               new Vertex(blocks[i + 1][j].name),
//               blocks[i][j].viscosity
//             )
//           );
//         }

//         if (blocks[i][j + 1]) {
//           g.addEdge(
//             new Edge(
//               startVertex,
//               new Vertex(blocks[i][j + 1].name),
//               blocks[i][j].viscosity
//             )
//           );
//         }
//       } else if (blocks[i][j + 1]) {
//         addEdge(
//           blocks[i][j].name,
//           blocks[i][j + 1].name,
//           blocks[i][j].viscosity
//         );
//       } else if (blocks[i + 1][j]) {
//         addEdge(
//           blocks[i][j].name,
//           blocks[i + 1][j].name,
//           blocks[i][j].viscosity
//         );
//       }
//     } catch {}
//   }
// }

const getDistance = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));

const getRandomNumber = (min = 0, max = 10) =>
  Math.random() * (max - min) + min;

const bookRide = (start, end) => {
  const path = g.shortestPath(start, end).map(name => {
    const block = blocks.flatMap(b => b).find(b => b.name === name);
    let mode;

    for (let transport of transports) {
      if (transport[0] >= block.viscosity && transport[1] < block.viscosity) {
        mode = transport[3];
      }
    }

    if (!mode) {
      mode = transports[transports.length - 1][3];
    }

    return { name: block.name, mode };
  });

  console.log(path);
};

app.get('/api/locations', (req, res) => {
  res.send(blocks.flatMap(p => p).map(p => p.name));
});

app.use((req, res) =>
  res
    .status(404)
    .type('txt')
    .send(`Cannot ${req.method} ${req.path}`)
);

app.listen(3000, () => {
  console.log('server listening on http://localhost:3000');
});

// bookRide('A', 'Y');
