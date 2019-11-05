import { gql } from 'apollo-server';

const blobs = `
source: String
account: String
product: String
category: String
cost: String
discontinued: String
syndicated: String
`

export const typeDefs = gql`
  scalar Date

  type Blobs {
    ${blobs}
  }

  type PassType {
      pass: String
  }

  type Query {
    tasks: [Task!]
    log(path: String): String
    user(name: String): PassType
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
    log: String
    blobs: BlobInput
  }

  type Mutation {
    createTask(task: TaskInput!): Task
  }

  type Task {
    status: _TaskStatus!
    type: String!
    time: Date!
    log: String
    blobs: Blobs
  }

  enum _TaskStatus {
    Started
    Queued
    Finished
  }
`;
