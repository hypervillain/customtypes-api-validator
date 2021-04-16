/***
 * You need to provided at least one token
 * to run it on stage: provide a STAGE_TOKEN and then run `npm run start:stage`
 * to run it on prod: provide a PROD_TOKEN and then run `npm run start:prod`
***/
const STAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsImlkIjoiNjAzNTBmNGEwYzY2YjA3NTcxYjdkYWQ0IiwiZGF0ZSI6MTYxODU4MzIyOSwiaWF0IjoxNjE4NTgzMjI5fQ.C3LmGYN1WH0vr658EisijCZZVhD8L1MM7iAfAsnWjGo'
const PROD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsImlkIjoiNThjNWM4YTUyNWJmNTE3MmExYTU2YjM3IiwiZGF0ZSI6MTYxODU4MjE4NSwiaWF0IjoxNjE4NTgyMTg1fQ.HWLMiQWKfNLYY6vWhPaExMQgwj6u-eJ0gp-EkNtTSUk'

const RepoParser = require('./repoparser')
const fetch = require('node-fetch')
const Files = require('./files')

const DEFAULT_TOKEN_VALUE = 'token'
const mode = process.env.MODE || 'prod'
const token = (() => {
  switch(mode) {
    case 'prod': return PROD_TOKEN
    case 'stage': return STAGE_TOKEN
    default: throw new Error(`Invalid mode provided ${mode}`)
  }
})() || DEFAULT_TOKEN_VALUE

if(token === DEFAULT_TOKEN_VALUE) throw new Error('Specificy an auth token [USER_TOKEN] in "index.js" at the top of the file')
if(!token) throw new Error('Missing authentication token')

RepoParser('repositories.txt').then(repositories => {

  console.log('----- Repositories List -----')
  console.log(repositories.join('\n'))
  console.log('-----------------------------')
  
  
  //generate new log
  var stream = Files.createWriteStream(`./logs/${mode}/logs-${Date.now().toString()}.txt`, { recursive: true, flags:'a' });
  
  repositories.forEach(repository => {
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
      const msg = (() => {
        switch(res.status) {
          case 200: return 'Loaded'
          case 401: return 'Unauthorized | probably an invalid token'
          case 404: return `Unavailable | You're probably not on an SM cluster`
          case 500: return 'Error | Cannot load the repository, some custom types are invalid.'
          default: return 'Anomaly | Cannot check if the custom types can be loaded on this repo'
        }
      })()
      stream.write(`[${repository}] - ${msg}\n`);
    })
    .catch(e => {
      stream.write(`[${repository}]\n${e}\n`)
    })
  })
})