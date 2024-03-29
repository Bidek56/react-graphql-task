import { PubSub } from 'graphql-subscriptions';
import jsonwebtoken from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET env not found')
}

const pubsub: PubSub = new PubSub();
const TASK_CREATED: string = 'TASK_CREATED';

const log = async (root: any, message: { path: string }, context: MyContext): Promise<string|null> => {
    // Log query resolver

    if (!isAuth(context)) {
        throw new Error("not authenticated");
    }

    if (!message || !message.path) {
        console.error('Message was null:', message)
        return null
    }

    return message.path + " text"
}

const users = [
    {
        id: 1,
        name: "admin",
        password: "$2b$10$ahs7h0hNH8ffAVg6PwgovO3AVzn1izNFHn.su9gcJnUWUzb2Rcb2W"
    }
]

interface MyContext {
    req: { headers: { authorization: string } };
    payload?: { userId: string };
}

const isAuth = (context: MyContext): boolean => {

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET env not found');
    }

    // console.log('Ctxt:', context )// .req?.headers)

    const authorization = context?.req?.headers?.authorization

    if (!authorization) {
        throw new Error("not authenticated");
    }

    try {
        const token = authorization?.split(" ")[1];
        const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET!);
        context.payload = payload as any;
        return true
    } catch (err) {
        console.log(err);
        throw new Error("not authenticated");
    }
}

// fetch the profile of currently authenticated user
const me = async (root: any, message: { name: string }, context: MyContext): Promise<{ id: number|undefined, name: string|undefined}> => {

    if (!message || !message.name)
        return {id:undefined, name:undefined};

    if (!isAuth(context)) {
        throw new Error("not authenticated");
    }

    const user = users.find(user => user.name === message.name)

    return { id: user?.id, name: user?.name }
}

// Handles user login
const login = async (root: any, message: { name: string, password: string}, ): Promise<string|null> => {

    if (!message || !message.name || !message.password)
        return null;

    const user = users.find(user => user.name === message.name)

    if (!user) {
        throw new Error('No user with that name')
    }

    if (!user.password) {
        throw new Error('No user password provided')
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET env not found');
    }

    const valid = bcryptjs.compare(message.password, user.password)

    if (!valid) {
        throw new Error('Incorrect password')
    }

    // return json web token
    return jsonwebtoken.sign(
        { id: user.id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' })
}

export const resolvers = {
    Mutation: {
        createTask: (root: any, message: any, context: any) => {
            // if (message) {
            //     console.log("Task:", JSON.stringify(message))
            // } else {
            //     console.log("Server null task:", message)
            // }
            // console.log("Blob:", message.task.blobs)

            // console.log('Ctxs:', context?.req?.headers)

            pubsub.publish(TASK_CREATED, { messageSent: message.status })
            // console.log("Msg:", message);

            return message.status
        },
    },
    Subscription: {
        messageSent: {
            subscribe: () => pubsub.asyncIterator(TASK_CREATED),
        },
    },
    Query: {
        log,
        me,
        login
    }
};
