import { PubSub } from 'apollo-server';

const pubsub: PubSub = new PubSub();
const TASK_CREATED: string = 'TASK_CREATED';

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
};
