var VertexObject = require('./VertexObject')
var noop = function () {}
var assign = require('object-assign')
var attribs = require('./attribute-utils')

module.exports = function createVBO (gl, attributes, elements, elementsType) {
  var vbo = new VertexBufferObject(gl)
  vbo.update(attributes, elements, elementsType)
  return vbo
}

function VertexBufferObject (gl) {
  VertexObject.call(this, gl)
}

VertexBufferObject.prototype = Object.create(VertexObject.prototype)
VertexBufferObject.constructor = VertexBufferObject

assign(VertexBufferObject.prototype, {

  dispose: noop,
  invalidate: noop,

  // associate this VBO with the given shader
  bind: function (shader) {
    attribs.bind(this.gl, this.attributes, this.elements, shader.attributes)
  },

  // must be the same shader that was used in bind()
  unbind: function (shader) {
    attribs.unbind(this.gl, this.attributes, this.elements, shader.attributes)
  }
})
