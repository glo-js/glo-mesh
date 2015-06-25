var getVersion = require('./glsl-tokens-extract-version')

module.exports = glslTokens100to300
function glslTokens100to300 (vertexTokens, fragTokens) {
  transpile(vertexTokens, true)
  transpile(fragTokens, false)
}

function transpile (tokens, isVertex) {
  var version = getVersion(tokens)
  if (!version) {
    tokens.splice(0, 0, {
      type: 'preprocessor',
      data: '#version 300 es'
    }, {
      type: 'whitespace',
      data: '\n'
    })
  }

  for (var i=0; i<tokens.length; i++) {
    var token = tokens[i];
    
    // if (token.type === 'preprocessor' || token.type === 'whitespace')
  }
}