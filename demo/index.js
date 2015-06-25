// testing low level GL utils

var createCamera = require('perspective-camera')
var createApp = require('canvas-loop')
var createShader = require('glo-shader')
var createTexture = require('glo-texture/2d')
var createMesh = require('../')
var createContext = require('get-canvas-context')
// var baboon = require('baboon-image-uri')
var loadImage = require('img')
var material = require('./mat-basic')

var gl = createContext('webgl2')
var canvas = document.body.appendChild(gl.canvas)
var shader = createShader(gl, material)

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
  // shader.uniforms.tint([1, 1, 1, 1])

  tex.bind()
  mesh.bind(shader)
  mesh.draw(gl.TRIANGLES)
  mesh.unbind(shader)
}
