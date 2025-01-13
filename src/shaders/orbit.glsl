varying vec3 vPosition;
uniform vec3 uColor;
uniform float uOpacity;

void main() {
  gl_FragColor = vec4(uColor, uOpacity * (1.0 - abs(vPosition.z / 1000.0)));
}
