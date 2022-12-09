# react-graphql-task
A React Task engine using Graphql pubsub to submit and await a task

## Installation and Development
npm i --legacy-peer-deps  # Due to MUI issues with React 18

### Server

* `cd server`
* `export JWT_SECRET=foo; export REACT_APP_AUTH_TOKEN=foo`
* `npm i`
* `npm run dev` or `NODE_ENV=development yarn build` or `NODE_ENV=production yarn build`
* visit: `http://localhost:8000/graphql`

### Client

* `cd client`
* `npm install`
* `npm run start` or `npm run build` and `npm run serve`
* visit `http://localhost:3000`

### Python server

* `cd pyserver`
* `python3 task_runner.py`

### Concurrently

* `yarn dev`

### Dev build
* `NODE_ENV=development yarn build`

### Mutation to submit a task

```
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
```

## Reference

[Simple chat)](https://github.com/LimeGreenJS/simple-chat)
