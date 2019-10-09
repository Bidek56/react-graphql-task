import { gql } from 'apollo-server';

const blobs = `
source: String
account: String
product: String
category: String
cost: String
sales: String
`

export const typeDefs = gql`
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
