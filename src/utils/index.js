export const getQuadraticDistance = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));

export const getRandomNumber = (min = 0, max = 10) =>
  Math.random() * (max - min) + min;
