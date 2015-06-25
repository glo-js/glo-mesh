module.exports = function glslExtractVersion (tokens) {
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.type === 'preprocessor') {
      var regex = /^\s*\#version\s+([0-9]+(\s+es)?)\s*$/
      var match = regex.exec(token.data)
      if (match) {
        return match[1]
      }
    }
  }
  return null
}
