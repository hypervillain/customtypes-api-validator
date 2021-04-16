const lineReader = require('line-reader');
const Promise = require('bluebird');

const eachLine = Promise.promisify(lineReader.eachLine)

module.exports = (fileName) => {
  let repositories = []
  
  return eachLine(fileName, (line) => {
      repositories = repositories.concat([line.trim()])
  }).then(() => {
    return repositories
  })
}