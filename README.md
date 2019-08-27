# react-graphql-task
A React Task engine using Graphql pubsub to submit and await a job

## Installation

### Server

* `cd server`
* `yarn`
* `yarn dev`
* visit: `http://localhost:8000/graphql`

### Client

* `cd client`
* `yarn`
* `yarn start`
* visit `http://localhost:3000`

### Python server

* `cd pyserver`
* `python3 task_runner.py`


### Mutation to submit a task

mutation task {
  createTask(
    task: {
      status: Started
      type: "7"
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
