// Note: This demo uses WebGL2 shaders.

// Testing some of the low-level utils.
// The typical end-user experience will not
// look like this, but it's good to know you
// can drop down if need be.

var createMesh = require('../')
var createCamera = require('perspective-camera')
var createApp = require('canvas-loop')
var createShader = require('glo-shader')
var createTexture = require('glo-texture/2d')
var createContext = require('get-canvas-context')
var loadImage = require('img')
var material = require('./mat-basic')
var transpile = require('./glsl-100-to-300')

var gl = createContext('webgl2')
// var webgl2 = true
// if (!gl) {
//   webgl2 = false
//   gl = createContext('webgl')
// }
// console.log("WebGL2?", webgl2)

var canvas = document.body.appendChild(gl.canvas)

// var transpiled = webgl2
//   ? transpile(material.vertex, material.fragment)
//   : material

var shader = createShader(gl, {
  name: material.name,
  vertex: material.vertex,
  fragment: material.fragment
})

var torus = require('torus-mesh')()
var model = require('gl-mat4/identity')([])

var camera = createCamera()

var mesh = createMesh(gl, {
  vao: true
})
  .attribute('position', torus.positions)
  .attribute('uv', torus.uvs)
  .attribute('normal', torus.normals)
  .elements(torus.cells)

var tex
var app = createApp(canvas)
  .on('tick', render)

loadImage('test.png', function (err, img) {
  if (err) throw err
  tex = createTexture(gl, img, [ img.width, img.height ], {
    wrap: gl.REPEAT,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    magFilter: gl.LINEAR
  }).generateMipmap()
  app.start()
})

function render () {
  var width = gl.drawingBufferWidth
  var height = gl.drawingBufferHeight
  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  camera.viewport = [0, 0, width, height]
  camera.identity()
  camera.translate([ -3, 0, -4 ])
  camera.lookAt([ 0, 0, 0 ])
  camera.update()

  shader.bind()
  shader.uniforms.projection(camera.projection)
  shader.uniforms.view(camera.view)
  shader.uniforms.model(model)
  shader.uniforms.iChannel0(0)

  tex.bind()
  mesh.bind(shader)
  mesh.draw(gl.TRIANGLES)
  mesh.unbind(shader)
}
