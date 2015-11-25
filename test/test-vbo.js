var test = require('tape')

var createMesh = require('../')
var createContext = require('webgl-context')
var snoop = require('gl-buffer-snoop')

test('should create array buffer', function (t) {
  var gl = createContext()
  snoop(gl)

  var mesh = createMesh(gl)
  t.equal(mesh.attributes.length, 0, 'no attributes')

  mesh.attribute('position', [ [2, 3, 4], [4, 2, 1] ])
  t.equal(mesh.attributes[0].name, 'position', 'gets name')
  t.equal(mesh.attributes[0].size, 3, 'default size 3')
  t.equal(mesh.attributes[0].usage, gl.STATIC_DRAW, 'default static draw')

  var gpuData = gl.getBufferData(mesh.attributes[0].buffer.handle)
  t.deepEqual(new Float32Array(gpuData.buffer), new Float32Array([2, 3, 4, 4, 2, 1]), 'saves buffer to GPU')

  mesh.attribute('position', [], { usage: gl.DYNAMIC_DRAW, size: 2 })
  t.equal(mesh.attributes[0].usage, gl.DYNAMIC_DRAW, 'changes usage')
  t.equal(mesh.attributes[0].size, 2, 'changes size')

  gpuData = gl.getBufferData(mesh.attributes[0].buffer.handle)
  t.deepEqual(new Float32Array(gpuData.buffer), new Float32Array([]), 'saves buffer to GPU')

  mesh.attribute('position', [ [3, 2, 1], [4, 3, 5] ])
  t.equal(mesh.attributes[0].usage, gl.DYNAMIC_DRAW, 'maintains usage')
  t.equal(mesh.attributes[0].size, 2, 'maintains size')

  gpuData = gl.getBufferData(mesh.attributes[0].buffer.handle)
  t.deepEqual(new Float32Array(gpuData.buffer), new Float32Array([3, 2, 1, 4, 3, 5]), 'saves buffer to GPU')

  t.end()
})
