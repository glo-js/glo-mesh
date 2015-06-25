#version 300 es

in vec2 uv;
in vec3 normal;
in vec4 position;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

out vec3 vNormal;
out vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normal;
  gl_Position = projection * view * model * position;
  gl_PointSize = 1.0;
}
