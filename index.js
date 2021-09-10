/***
 * You need to provided at least one token
 * to run it on stage: provide a STAGE_TOKEN and then run `npm run start:stage`
 * to run it on prod: provide a PROD_TOKEN and then run `npm run start:prod`
***/

const RepoParser = require('./repoparser')
const fetch = require('node-fetch')
const Files = require('./files')
const Config = require('./config.json')

const DEFAULT_TOKEN_VALUE = 'token'
const mode = process.env.MODE || 'prod'
const token = (() => {
  switch(mode) {
    case 'prod': return Config.PROD_TOKEN
    case 'stage': return Config.STAGE_TOKEN
    default: throw new Error(`Invalid mode provided ${mode}`)
  }
})() || DEFAULT_TOKEN_VALUE

if(token === DEFAULT_TOKEN_VALUE) throw new Error('Specificy an auth token [USER_TOKEN] in "index.js" at the top of the file')
if(!token) throw new Error('Missing authentication token')

RepoParser('repositories.txt').then(allRepos => {

  console.log('----- Repositories List -----')
  console.log(allRepos.join('\n'))
  console.log('-----------------------------')
  
  
  //generate new log
  var stream = Files.createWriteStream(`./logs/${mode}/logs-${Date.now().toString()}.txt`, { recursive: true, flags:'a' });
  
  function analyseNextRepository(repositories) {
    if(!repositories || !repositories.length) return;

    const [repository, tail] = [repositories[0], repositories.slice(1)]
    const domain = (() => {
      switch(mode) {
        case 'prod': return 'prismic.io'
        case 'stage': return 'wroom.io'
        default: throw new Error(`Invalid mode provided ${mode}`)
      }
    })()
    
    const allCTsEndpoint = `https://customtypes.${domain}/customtypes`
    
    fetch(allCTsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'repository': repository
      }
    })
    .then(res => {
      return res.text().then(text => [res.status, text])
    })
    .then(([status, text]) => {
      const msg = (() => {
        switch(status) {
          case 200: return 'Loaded'
          case 401: return 'Unauthorized | probably an invalid token'
          case 404: return `Unavailable | You're probably not on an SM cluster`
          case 500: return 'Error | Cannot load the repository, some custom types are invalid.'
          default: return `Anomaly | Cannot check if the custom types can be loaded on this repo ||| ${status} -- ${text}`
        }
      })()
      stream.write(`[${repository}] - ${msg}\n`);
      
      try {
        const ct = JSON.parse(text)
        const tabs = Object.entries(ct.json)
        tabs.forEach(([tabKey, values]) => {
          Object.entries(values).forEach(([fieldKey, field]) => {
            if (field.type === 'UID' && fieldKey !== 'uid') {
              stream.write(`[${repository}] WRONG UID KEY IN ct ${ct.id}, tab ${tabKey}, fieldkey: ${fieldKey}`);
            }
          })
        })
      } catch(e) {
        console.error(e)
      }

      setTimeout(() => {
        analyseNextRepository(tail)
      }, Config.SLEEP_MS)
    })
    .catch(e => {
      stream.write(`[${repository}]\n${e}\n`)
    })
  }

  analyseNextRepository(allRepos)
})
