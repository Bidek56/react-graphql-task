# react-graphql-task
A React Task engine using Graphql pubsub to submit and await a task

## Installation and Development
yarn --cwd ./client/ add react-helmet

### Server

* `cd server`
* `yarn`
* `yarn dev` or `NODE_ENV=development yarn build` or `NODE_ENV=production yarn build`
* visit: `http://localhost:8000/graphql`

### Client

* `cd client`
* `yarn`
* `yarn start` or `yarn build` and `yarn serve`
* visit `http://localhost:3000`

### Python server

* `cd pyserver`
* `python3 task_runner.py`

### Concurrently

* `yarn dev`

### Dev build
* `NODE_ENV=development yarn build`

### Mutation to submit a task

mutation task {
  createTask(
    task: {
      status: Started
      type: "prod"
      time: "8/28/2019"
      blobs: {
        source: "ss",
        account: "dd",
        product: "pp"
      }
    }
  ) {
    type
    status
    blobs { product account source}
  }
}

## Reference

[Simple chat)](https://github.com/LimeGreenJS/simple-chat)
