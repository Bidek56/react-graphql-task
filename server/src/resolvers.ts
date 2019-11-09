import { PubSub } from 'apollo-server';
import jsonwebtoken from 'jsonwebtoken'
import { Request, Response } from "express";
import bcryptjs from 'bcryptjs'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../.env'), debug: process.env.DEBUG })
}

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET env not found')
}

const pubsub: PubSub = new PubSub();
const TASK_CREATED: string = 'TASK_CREATED';

const log = async (root: any, message: { path: string }, context: MyContext): Promise<string> => {
    // Log query resolver

    if (!isAuth(context)) {
        throw new Error("not authenticated");
    }

    if (!message || !message.path) {
        console.error('Message was null:', message)
        return null
    }

    return message.path + "log text"
}

const users = [
    {
        id: 1,
        name: process.env.REACT_APP_USER,
        password: process.env.REACT_APP_AUTH_TOKEN
    }
]

interface MyContext {
    req: Request;
    res: Response;
    payload?: { userId: string };
}

const isAuth = (context: MyContext): boolean => {

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET env not found');
    }

    console.log('Ctxt:', context.req.headers)

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
const me = async (root: any, message: { name: string }, context: MyContext): Promise<{ id: number, name: string }> => {

    if (!message || !message.name)
        return null

    if (!isAuth(context)) {
        throw new Error("not authenticated");
    }

    const user = users.find(user => user.name === message.name)

    return { id: user.id, name: user.name }
}

// Handles user login
const login = async (root: any, message: { name: string, password: string }, ): Promise<string> => {

    if (!message || !message.name || !message.password)
        return null

    const user = users.find(user => user.name === message.name)

    if (!user) {
        throw new Error('No user with that name')
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
        createTask: (root, message, context) => {
            // console.log("Task:", message.task)
            // console.log("Blob:", message.task.blobs)

            console.log('Ctxs:', context.req.headers)

            pubsub.publish(TASK_CREATED, { messageSent: message.task }).then(res => {
                console.log('Pub res:', res)
            })

            return message.task
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
