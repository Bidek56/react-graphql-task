import { PubSub } from 'apollo-server';
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../.env'), debug: process.env.DEBUG })
}

const pubsub: PubSub = new PubSub();
const TASK_CREATED: string = 'TASK_CREATED';

const log = async (root: any, message: { path: string }, ): Promise<string> => {
    // Log query resolver

    if (!message || !message.path) {
        console.error('Message was null:', message)
        return null
    }

    return message.path + "log text"
}

const user = (root: any, message: { name: string }, ): { pass: string } | null => {

    if (!message || !message.name)
        return null

    // console.log('AUTH:', process.env.REACT_APP_AUTH_TOKEN)

    // Check for env variables
    if (!process.env.REACT_APP_AUTH_TOKEN || !process.env.REACT_APP_USER)
        return null

    if (process.env.REACT_APP_USER === message.name) {
        // console.log(`Name:${message.name}`)
        // console.log(`User:${process.env.REACT_APP_USER}`)
        return { "pass": process.env.REACT_APP_AUTH_TOKEN }
    }
    else
        return null
}

export const resolvers = {
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
    Query: {
        log,
        user
    }
};
