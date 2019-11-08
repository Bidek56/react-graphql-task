import { graphqlTestCall } from "./graphqlTestCall";

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
    mutation userLogin($name: String!, $password: String!) {
        login(name: $name, password: $password)
    }
`

describe("resolvers", () => {

    it("login", async () => {
        const loginResponse = await graphqlTestCall(LOGIN_MUTATION, { name: "admin", password: "$2b$10$ahs7h0hNH8ffAVg6PwgovO3AVzn1izNFHn.su9gcJnUWUzb2Rcb2W" });
        // console.log('Login:', loginResponse)

        expect(loginResponse).toBeDefined();
        expect(loginResponse).not.toBeNull();
        expect(loginResponse.errors).toBeUndefined();

        if (loginResponse.errors) {
            console.error(loginResponse);
            return
        }

        global['token'] = loginResponse?.data?.login

        expect(loginResponse.data).toBeDefined();
        expect(loginResponse.data.login).toBeDefined();
        expect(loginResponse.data.login).not.toBeNull();
    })

    it("mutation", async () => {

        const taskResponse = await graphqlTestCall(CREATE_TASK_MUTATION, {
            status: "Started",
            type: "Promo Table(s)",
            time: "1/1/2019",
            log: "etl_2019_10_21_21_54_33.log"
        });

        expect(taskResponse).toBeDefined();

        // console.log(taskResponse);

        expect(taskResponse).toEqual({
            data: {
                createTask: {
                    status: 'Started'
                }
            }
        });
    });

    it("task query", async () => {
        const taskResponse = await graphqlTestCall(TASK_QUERY, {});
        expect(taskResponse).toBeDefined();
        expect(taskResponse).toEqual({
            data: { tasks: null }
        });
    });

    it("log query", async () => {
        expect(global['token']).toBeDefined();
        expect(global['token']).not.toBeNull();
        expect(global['token'].length).toBeGreaterThan(6);

        const logResponse = await graphqlTestCall(LOG_QUERY, { path: "etl_2019_10_21_21_54_33.log" }, global['token']);

        expect(logResponse).toBeDefined();
        expect(logResponse).not.toBeNull();

        if (logResponse.errors) {
            console.error(logResponse);
            return
        }

        expect(logResponse.data).toBeDefined();
        expect(logResponse.data.log).toBeDefined();
        expect(logResponse.data.log).not.toBeNull();
        expect(logResponse.data.log.length).toBeGreaterThan(1);
    }, 30000);

    it("me", async () => {

        expect(global['token']).toBeDefined();
        expect(global['token']).not.toBeNull();
        expect(global['token'].length).toBeGreaterThan(6);

        const meResponse = await graphqlTestCall(ME_QUERY, { name: "admin" }, global['token']);
        // console.log('Me:', meResponse)

        expect(meResponse).toBeDefined();
        expect(meResponse).not.toBeNull();

        if (meResponse.errors) {
            console.error(meResponse);
            return
        }

        expect(meResponse.data).toBeDefined();
        expect(meResponse.data.me).toBeDefined();
        expect(meResponse.data.me).not.toBeNull();
        expect(meResponse.data.me.id).toEqual(1);
        expect(meResponse.data.me.name).toEqual('admin')
    })
});