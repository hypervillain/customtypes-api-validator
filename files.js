const fs = require('fs')
const path = require('path')

module.exports = {
  createWriteStream: (pathToFile, options = { recursive: true, flags: 'w' }) => {
    if(options.recursive) {
      const directoryPath = path.dirname(pathToFile)
      fs.mkdirSync(directoryPath, { recursive: true })
    }
    return fs.createWriteStream(pathToFile, { flags: options.flags });
  }
}
