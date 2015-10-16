var VertexObject = require('./VertexObject')
var createVBO = require('./vertex-buffer-object')
var assign = require('object-assign')
var attribs = require('./attribute-utils')
var getExtension = require('gl-extension')

module.exports = function createVAO (gl, attributes, elements, elementsType) {
  var ext = getExtension(gl, 'OES_vertex_array_object')
  if (!ext) { // fallback, emulate VAO with VBO
    return createVBO(gl, attributes, elements, elementsType)
  }

  var maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) | 0
  var vbo = new VertexArrayObject(gl, ext, maxAttribs)
  vbo.update(attributes, elements, elementsType)
  return vbo
}

function VertexArrayObject (gl, ext, maxAttribs) {
  VertexObject.call(this, gl)
  this.handle = null
  this._maxAttribs = maxAttribs
  this._dirty = false
  this._ext = ext
  this.create()
}

VertexArrayObject.prototype = Object.create(VertexObject.prototype)
VertexArrayObject.constructor = VertexArrayObject

assign(VertexArrayObject.prototype, {

  create: function () {
    if (this.handle === null) {
      this.handle = this._ext.createVertexArrayOES()
    }
  },

  dispose: function () {
    if (this.handle !== null) {
      this._ext.deleteVertexArrayOES(this.handle)
    }
    this.handle = null
  },

  invalidate: function () {
    this._dirty = true
  },

  bind: function (shader) {
    this.create()
    this._ext.bindVertexArrayOES(this.handle)

    // if we need to update the bindings ...
    if (this._dirty) {
      attribs.unbindAll(this.gl, this._maxAttribs)
      attribs.bind(this.gl, this.attributes, this.elements, shader.attributes)
    }
  },

  // must be the same shader that was used in bind()
  unbind: function () {
    this._ext.bindVertexArrayOES(null)
  }
})
