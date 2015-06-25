#version 300 es
precision mediump float;

out vec4 fragOut;
in vec2 vUv;
in vec3 vNormal;
uniform sampler2D iChannel0;
uniform sampler3D tLookupTable;

void main() {
   fragOut = texture(iChannel0, vUv * vec2(4.0, 1.0));
}