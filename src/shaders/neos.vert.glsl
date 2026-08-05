uniform float uTime;

attribute float aElement;
attribute float eElement;
attribute float iElement;
attribute float OmegaElement;
attribute float omegaElement;
attribute float M0Element;
attribute float nElement;
attribute float scaleElement;
attribute vec3 colorElement;

varying vec3 vColor;

#define TAU 6.283185307179586
#define AU_SCALE 200.0

vec3 computeKeplerPosition(
  float a,
  float e,
  float i,
  float Omega,
  float omega,
  float M0,
  float n,
  float t
) {
  float M = mod(M0 + n * t, TAU);

  float E = M;
  for (int j = 0; j < 5; j++) {
    E = E - (E - e * sin(E) - M) / (1.0 - e * cos(E));
  }

  float nu = 2.0 * atan(sqrt((1.0 + e) / (1.0 - e)) * tan(E / 2.0));
  float r = a * (1.0 - e * cos(E));

  float cosO = cos(Omega);
  float sinO = sin(Omega);
  float coswv = cos(omega + nu);
  float sinwv = sin(omega + nu);
  float cosi = cos(i);

  vec3 pos;
  pos.x = r * (cosO * coswv - sinO * sinwv * cosi);
  pos.y = r * (sinO * coswv + cosO * sinwv * cosi);
  pos.z = r * (sinwv * sin(i));
  return pos;
}

void main() {
  vec3 orbitalPos = computeKeplerPosition(
    aElement, eElement, iElement, OmegaElement,
    omegaElement, M0Element, nElement, uTime
  );

  vec3 worldPos = orbitalPos * AU_SCALE + position * scaleElement;

  vColor = colorElement;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(worldPos, 1.0);
}
