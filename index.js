var assign = require('object-assign')

var flattenVertexData = require('flatten-vertex-data')
var isTypedArray = require('is-typedarray')
var fromGLType = require('gl-to-dtype')
var createBuffer = require('./lib/buffer')
var createVBO = require('./lib/vertex-buffer-object')

// ideally, allow this to be optional
// var createVAO = require('./lib/vertex-array-object')

var indexOfName = require('indexof-property')('name')
var defined = require('defined')
var getter = require('dprop')

module.exports = function createMesh (gl) {
  return new AttributeMesh(gl)
}

function AttributeMesh (gl) {
  this.gl = gl
  this.attributes = []
  this._elements = null
  this._elementsSize = null
  this._elementsType = null
  this._dirty = true
  this.bindings = createVBO(gl)
}

Object.defineProperty(AttributeMesh.prototype, 'count', getter(function () {
  if (this._elements) {
    return this._elements.length
  } else {
    if (this.attributes.length === 0 || this.attributes[0].size === 0) {
      return 0
    }
    return this.attributes[0].buffer.length / this.attributes[0].size
  }
}))

assign(AttributeMesh.prototype, {

  dispose: function () {
    if (this._elements) {
      this._elements.dispose()
    }
    if (this.attributes) {
      this.attributes.forEach(function (attrib) {
        if (attrib.buffer) attrib.buffer.dispose()
      })
    }
    this.bindings.dispose()
    this._dirty = true
    this._elements = null
    this._elementsSize = null
    this._elementsType = null
    this.attributes.length = 0
  },

  bind: function (shader) {
    if (!shader) {
      throw new Error('must provide shader to mesh bind()')
    }

    if (this._dirty) {
      if (process.env.NODE_ENV !== 'production') {
        for (var i = 0; i < this.attributes.length; i++) {
          var name = this.attributes[i].name
          var attrib = shader.attributes[name]
          if (!attrib || typeof attrib.location !== 'number') {
            console.warn("Specified shader does not have an attribute '" + name + "'")
          }
        }
      }

      this.bindings.update(this.attributes, this._elements, this._elementsType)
      this._dirty = false
    }

    this.bindings.bind(shader)
    return this
  },

  unbind: function (shader) {
    if (!shader) {
      throw new Error('must provide shader to mesh unbind()')
    }

    this.bindings.unbind(shader)
    return this
  },

  draw: function (mode, count, offset) {
    count = defined(count, this.count)
    this.bindings.draw(mode, count, offset)
    return this
  },

  // replaces attribute
  attribute: function (name, data, opt) {
    var attribIdx = indexOfName(this.attributes, name)
    var attrib = attribIdx === -1 ? null : this.attributes[attribIdx]
    if (typeof data === 'undefined') { // getter
      return attrib
    }

    var gl = this.gl
    opt = opt || {}

    var array = unroll(data, fromGLType(opt.type) || 'float32')
    var size = opt.size || guessSize(data, 3)
    var buffer
    if (!attrib) { // create new attribute
      buffer = createBuffer(gl, array, gl.ARRAY_BUFFER, opt.usage)
      attrib = assign({
        name: name,
        size: size
      }, opt, { buffer: buffer })
      this.attributes.push(attrib)
    } else { // update existing
      buffer = attrib.buffer
      // mutate existing attribute info like stride/etc
      assign(attrib, opt, { buffer: buffer })
      buffer.usage = defined(opt.usage, buffer.usage)
      buffer.update(array)
    }

    this._dirty = true
    return this
  },

  elements: function (data, opt) {
    if (typeof data === 'undefined') { // getter
      return this._elements
    }

    opt = opt || {}
    var gl = this.gl
    var size = opt.size || guessSize(data, 3)
    var defaultType = opt.type || 'uint16'
    var array = unroll(data, fromGLType(defaultType) || defaultType)

    if (this._elements) { // update existing
      this._elementsType = opt.type
      this._elements.usage = defined(opt.usage, this._elements.usage)
      this._elementsSize = size
      this._elements.update(array)
    } else { // create new element buffer
      this._elementsSize = defined(opt.size, this._elementsSize)
      this._elements = createBuffer(gl, array, gl.ELEMENT_ARRAY_BUFFER, opt.usage)
    }

    this._dirty = true
    return this
  }
})

function guessSize (data, defaultSize) {
  if (data.length && data[0].length) {
    return data[0].length
  }
  return defaultSize
}

function unroll (data, type) {
  return isTypedArray(data)
      ? data
      : flattenVertexData(data, type)
}
