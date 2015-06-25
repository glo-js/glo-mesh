var test = require('tape')
var fs = require('fs')
var path = require('path')
var vert = fs.readFileSync(path.resolve(__dirname, '..', 'demo', 'mat-basic.vert'), 'utf8')
var frag = fs.readFileSync(path.resolve(__dirname, '..', 'demo', 'mat-basic.frag'), 'utf8')
var transpile = require('../demo/glsl-transpile-version')
var tokenize = require('glsl-tokenizer')
var stringify = require('glsl-token-string')

test('should transpile', function (t) {
  var tokens = tokenize(vert)
  var result = transpile(tokens, 'vertex', '300')
  var resultSrc = stringify(result)

  debugger
  t.end()
})