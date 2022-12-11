import { describe, expect, test, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { ApolloServer, BaseContext } from '@apollo/server';

// we import a function that we wrote to create a new instance of Apollo Server
import { createApolloServer } from './server';

// we'll use supertest to test our server
import request, {agent} from 'supertest';

const ME_QUERY = `
    query me($name: String!) {
        me(name: $name) {
            id name
        }
    }
`

// this is the query for our test
const queryData = {
    query: `query me($name: String!) {
      me(name: $name) {
        id name
      }
    }`,
    variables: { name: 'admin' }
  };

const LOGIN_MUTATION = {
    query: `query userLogin($name: String!, $password: String!) {
                login(name: $name, password: $password)
            }`,
    variables: { name: 'admin', password: "$2b$10$ahs7h0hNH8ffAVg6PwgovO3AVzn1izNFHn.su9gcJnUWUzb2Rcb2W" }
}

const CREATE_TASK_MUTATION = {
    query: `mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $log: String, $blobs: BlobInput) {
                createTask(task: {status: $status, type: $type, time: $time, log: $log, blobs: $blobs }) {
                    status
                }
            }`,
    variables: {
            status: "Started",
            type: "Promo Table(s)",
            time: "1/1/2019",
            log: "etl_2019_10_21_21_54_33.log"
    }
}

const TASK_QUERY = {
    query: `query {
        tasks { status type time log }
    }`
};

const LOG_QUERY = {
    query: `query logs($path: String) { log(path: $path) } `,
    variables: { path: "etl_2019_10_21_21_54_33.log" }
};

describe('e2e demo', () => {
    let server: ApolloServer<BaseContext>, url: string;
  
    // before the tests we spin up a new Apollo Server
    beforeAll(async () => {
      // Note we must wrap our object destructuring in parentheses because we already declared these variables
      // We pass in the port as 0 to let the server pick its own ephemeral port for testing
      ({ server, url } = await createApolloServer({ port: 4000 }));
    });
  
    // after the tests we'll stop the server
    afterAll(async () => {
      await server?.stop();
    });

    test("login", async () => {
        const loginResponse = await request(url).post('').set('x-apollo-operation-name', "test").send(LOGIN_MUTATION)
        // console.log('Login:', loginResponse)

        expect(loginResponse).toBeDefined();
        expect(loginResponse.ok).toBeTruthy();
        expect(loginResponse).not.toBeNull();
        expect(loginResponse.body.error).toBeUndefined();

        if (loginResponse.body.error) {
            console.error(loginResponse);
            return
        }

        global['token'] = loginResponse?.body?.data?.login

        expect(loginResponse?.body?.data).toBeDefined();
        expect(loginResponse?.body?.data.login).toBeDefined();
        expect(loginResponse?.body?.data.login).not.toBeNull();
    })
  
    test.skip("mutation", async () => {
        const taskResponse = await request(url).post('').set('x-apollo-operation-name', "test").send(CREATE_TASK_MUTATION)

        expect(taskResponse).toBeDefined();
        expect(taskResponse?.body?.data).toBeDefined();

        console.log("Task resp:", taskResponse.body.data);

        expect(taskResponse?.body.data).toEqual({ createTask: { status: 'Started' } });
    });

    test("task query", async () => {
        const taskResponse = await request(url).post('').set('x-apollo-operation-name', "test").send(TASK_QUERY)
        expect(taskResponse.body).toBeDefined();
        expect(taskResponse.body).toEqual({ data: { tasks: null } });
    });

    test.skip("log query", async () => {
        expect(global['token']).toBeDefined();
        expect(global['token']).not.toBeNull();
        expect(global['token'].length).toBeGreaterThan(6);

        const logResponse = await request(url).post('') // .set('x-apollo-operation-name', "test")
                    .set( { req: { 'Authorization': 'Bearer ' + global['token'] } })
                    .send(LOG_QUERY)

        expect(logResponse).toBeDefined();
        expect(logResponse).not.toBeNull();

        // console.log(logResponse.body.errors);

        if (logResponse.body.errors) {
            console.error(logResponse.body.errors);
            return
        }

        expect(logResponse?.body.data).toBeDefined();
        expect(logResponse?.body.data?.log).toBeDefined();
        expect(logResponse?.body.data?.log).not.toBeNull();
        expect(logResponse?.body.data?.log?.length).toBeGreaterThan(1);
    }, 30000);
  });
