import * as THREE from "three";

export const AU_SCALE = 200;
export const EPOCH = new Date("2000-01-01");
const EPOCH_MS = EPOCH.getTime();

const G = 6.6743e-11;
const SUN_MASS = 1.989e30;
const AU_TO_M = 1.496e11;

function meanMotion(semiMajorAxisAU) {
  const semiMajorInM = semiMajorAxisAU * AU_TO_M;
  const T_seconds = Math.sqrt(
    (4 * Math.PI * Math.PI * semiMajorInM ** 3) / (G * SUN_MASS)
  );
  return (2 * Math.PI) / (T_seconds / 86400);
}

export function precomputeConstants({ e, a, incl, Omega, w }) {
  return {
    e: e ?? 0,
    a: a ?? 0,
    i: THREE.MathUtils.degToRad(incl ?? 0),
    Omega: THREE.MathUtils.degToRad(Omega ?? 0),
    omega: THREE.MathUtils.degToRad(w ?? 0),
    n: meanMotion(a ?? 0),
  };
}

export function getBodyPosition(constants, timeMs, out) {
  const deltaT = (timeMs - EPOCH_MS) / 86400000;
  const { e, a, i, Omega, omega, n } = constants;

  let M = n * deltaT;
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  let E = M;
  for (let j = 0; j < 5; j++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  const nu = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2));
  const r = a * (1 - e * Math.cos(E));

  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const coswv = Math.cos(omega + nu);
  const sinwv = Math.sin(omega + nu);
  const cosi = Math.cos(i);

  out.set(
    r * (cosOmega * coswv - sinOmega * sinwv * cosi),
    r * (sinOmega * coswv + cosOmega * sinwv * cosi),
    r * sinwv * Math.sin(i)
  );

  return out;
}
