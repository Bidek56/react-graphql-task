import { PubSub, gql, ApolloServer } from 'apollo-server';

const pubsub = new PubSub();
const TASK_CREATED = 'TASK_CREATED';

const blobs = `
source: String
account: String
product: String
category: String
cost: String
`

const typeDefs = gql`
  scalar Date

  type Blobs {
    ${blobs}
  }

  type Query {
    tasks: [Task!]
  }

  type Subscription {
    messageSent: Task
  }

  input BlobInput {
    ${blobs}
  }

  input TaskInput {
    status: _TaskStatus!
    type: String!
    time: Date!
    blobs: BlobInput
  }

  type Mutation {
    createTask(task: TaskInput!): Task
  }

  type Task {
    status: _TaskStatus!
    type: String!
    time: Date!
    blobs: Blobs
  }

  enum _TaskStatus {
    Started
    Queued
    Finished
  }
`;

const resolvers = {
    Mutation: {
        createTask: (root, message, context) => {
            // console.log("Task:", message.task)
            // console.log("Blob:", message.task.blobs)

            pubsub.publish(TASK_CREATED, { messageSent: message.task });

            return message.task
        }
    },
    Subscription: {
        messageSent: {
            subscribe: () => pubsub.asyncIterator(TASK_CREATED),
        },
    },
};

const authToken = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
        onConnect: (connectionParams, webSocket) => {
            // console.log('connectionParams:', connectionParams)
            if (connectionParams['authToken'] && authToken === connectionParams['authToken'])
                return

            throw new Error('Missing auth token!');
        },
    },
});

server.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
});