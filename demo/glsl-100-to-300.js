var transpile = require('./glsl-tokens-to-300')
var tokenize = require('glsl-tokenizer')
var stringify = require('glsl-token-string')

module.exports = function glslTranspile100to300 (vertex, fragment) {
  var vertTokens = tokenize(vertex)
  var fragTokens = tokenize(fragment)

  transpile(vertTokens, fragTokens)
  return {
    vertex: stringify(vertTokens),
    fragment: stringify(fragTokens)
  }
}
