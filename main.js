import Dijkstra from './src/algorithms/graphs/dijkstra';
import Graph from './src/data-structures/graph';
import Vertex from './src/data-structures/graph/vertex';
import Edge from './src/data-structures/graph/edge';

import blocksData from 'data/blocks.json';
import transports from 'data/transports.json';

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

const g = new Graph();

// blocks.forEach(val1 =>
//   val1.forEach(val2 => g.addVertex(new Vertex(val2.name)))
// );

const vertex = new Vertex('A');
g.addEdge(new Edge(vertex, new Vertex('B'), 3));
g.addEdge(new Edge(new Vertex('C'), new Vertex('B'), 3));

console.log(Dijkstra(g, vertex));

// for (let i = 0; i < blocks.length; i += 1) {
//   for (let j = 0; j < blocks[i].length; j += 1) {
//     try {
//       if (blocks[i + 1][j]) {
//         try {
//           g.addEdge(
//             new Edge(
//               new Vertex(blocks[i][j].name),
//               new Vertex(blocks[i + 1][j].name),
//               blocks[i][j].viscosity
//             )
//           );
//         } catch {}
//       }

//       if (blocks[i][j + 1]) {
//         try {
//           g.addEdge(
//             new Edge(
//               new Vertex(blocks[i][j].name),
//               new Vertex(blocks[i][j + 1].name),
//               blocks[i][j].viscosity
//             )
//           );
//         } catch {}
//       }
//     } catch {}
//   }
// }

// console.log(g.getAllVertices());

// console.log(
//   JSON.stringify(
//     blocks.map((v, i) =>
//       v.map((v2, j) => ({
//         ...v2,
//         lat: i,
//         lng: j,
//       }))
//     )
//   )
// );

const getDistance = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));

const getRandomNumber = (min = 0, max = 10) =>
  Math.random() * (max - min) + min;

const bookRide = (start, end) => {
  const startLocation = blocks
    .flatMap(block => block)
    .find(block => block.name === start);
  const endLocation = blocks
    .flatMap(block => block)
    .find(block => block.name === end);

  if (startLocation && endLocation) {
    const distance = getDistance(
      startLocation.lat,
      startLocation.lng,
      endLocation.lat,
      endLocation.lng
    );
    const path = [startLocation.name];

    for (let i = 0, j = 0; ; ) {
      if (
        i + 1 < blocks.length &&
        j + 1 < blocks[i].length &&
        blocks[i + 1][j].viscosity < blocks[i][j + 1].viscosity
      ) {
        path.push(blocks[i + 1][j].name);
        i += 1;
      } else if (
        i + 1 < blocks.length &&
        j + 1 < blocks[i].length &&
        blocks[i][j + 1].viscosity < blocks[i + 1][j].viscosity
      ) {
        path.push(blocks[i][j + 1].name);
        j += 1;
      } else if (i + 1 < blocks.length) {
        if (i + 1 < endLocation.lat) {
          path.push(blocks[i + 1][j].name);
        }

        i += 1;
      } else if (j + 1 < blocks[i].length && j + 1 < endLocation.lng) {
        path.push(blocks[i][j + 1].name);
        j += 1;
      } else {
        i += 1;
      }
    }

    console.log(path.join(' -> '));
  } else {
    console.log('Location not found');
  }
};

// bookRide('A', 'Y');
