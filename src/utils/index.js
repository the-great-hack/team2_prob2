export const getQuadraticDistance = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));

export const getRandomNumber = (min = 0, max = 10) =>
  Math.random() * (max - min) + min;

export const calculateViscosity = (
  transports,
  lanes,
  carCount,
  busAllowed = true
) => {
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
