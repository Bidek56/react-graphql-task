import { describe, expect, test } from 'vitest'
import { resolvers } from "./resolvers";

const CREATE_TASK_MUTATION = `
    mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $log: String, $blobs: BlobInput) {
        createTask(task: {status: $status, type: $type, time: $time, log: $log, blobs: $blobs }) {
            status
        }
    }
`;

const TASK_QUERY = `
    query {
        tasks {
            status
            type
            time
            log
        }
    }
`
const LOG_QUERY = `
    query logs($path: String) {
        log(path: $path)
    }
`
const ME_QUERY = `
    query me($name: String!) {
        me(name: $name) {
            id name
        }
    }
`
const LOGIN_MUTATION = `
    query userLogin($name: String!, $password: String!) {
        login(name: $name, password: $password)
    }
`
describe("resolvers", () => {

    test("login", async () => {

        const token = await resolvers.Query.login(LOGIN_MUTATION, 
                { name: "admin", password: "$2b$10$ahs7h0hNH8ffAVg6PwgovO3AVzn1izNFHn.su9gcJnUWUzb2Rcb2W" });

        // console.log('Token:', token)

        expect(token).toBeDefined();
        expect(token).not.toBeNull();
        global['token'] = token;
    })

    test("mutation", async () => {

        const taskResponse = resolvers.Mutation.createTask(CREATE_TASK_MUTATION, 
            {
                status: "Started",
                type: "PTables",
                time: "1/1/2019",
                log: "etl_2019_10_21_21_54_33.log"
            },
            {}
            );

        // console.log("Resp:", taskResponse);
        expect(taskResponse).toBeDefined();
        expect(taskResponse).toEqual("Started");
    });

    test("log query", async () => {
        expect(global['token']).toBeDefined();
        expect(global['token']).not.toBeNull();
        expect(global['token'].length).toBeGreaterThan(6);

        const logResponse = await resolvers.Query.log(LOG_QUERY, { path: "etl_2019_10_21_21_54_33.log" }, 
            {
                req: {
                    headers: {
                        authorization: 'Bearer ' + global['token']
                    },
                }
            });

        // console.log("log resp:", logResponse);
        expect(logResponse).toBeDefined();
        expect(logResponse).not.toBeNull();
        expect(logResponse.length).toBeGreaterThan(10);
    }, 30000);

    test("me", async () => {

        expect(global['token']).toBeDefined();
        expect(global['token']).not.toBeNull();
        expect(global['token'].length).toBeGreaterThan(6);

        const meResponse = await resolvers.Query.me(ME_QUERY, { name: "admin" },
        {
            req: {
                headers: {
                    authorization: 'Bearer ' + global['token']
                },
            },
        }
        );

        // console.log('Me:', meResponse)

        expect(meResponse).toBeDefined();
        expect(meResponse).not.toBeNull();

        expect(meResponse?.id).toBeDefined();
        expect(meResponse?.id).not.toBeNull();
        expect(meResponse?.id).toEqual(1);
        expect(meResponse?.name).toEqual('admin')
    })
});