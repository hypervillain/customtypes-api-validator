# Custom Types API Validator

By introducing the Custom Types API, we introduced a way stronger validation on custom types.
It mean also that the current custom types stored in your repository can be invalid for the new Custom Type API.
This tool provide a way to query your custom types through the Custom Type API and make sure that they are all valid before switching to SliceMachine.

## Setup

### Step 1: Authentication

!!! You need to be authenticated to be able to use this tool. You'll only be able to test repositories you have access to. !!!

Either grab your `prismic-auth` cookie when logged in on Prismic or authenticate with `auth.wroom.io/login` or `auth.prismic.io/login` depending which repos you need to test.

Copy `config.demo.json` to a file named `config.json`, provide a token either `STAGE_TOKEN` or `PROD_TOKEN`


### Step 2: specifiying repositories
Inside `repositories.txt`, put all the repositories that you need to test, one per line.
eg: if you have repos running on `https://myrepo.prismic.io` and `https://myrepo2.prismic.io` and you wanna test them, please write inside `repositories.txt` as follow:
```
myrepo
myrepo2
```

## Run the tool
 * On stage repositories with a `STAGE_TOKEN`: `npm run start:stage`
 * On stage repositories with a `PROD_TOKEN`: `npm run start:prod` | `npm start`

## Logs
All the logs are stored inside the `logs` folder, by environment `stage` or `prod` and each time you run the tool, it will generate a new log file with a timestamp.