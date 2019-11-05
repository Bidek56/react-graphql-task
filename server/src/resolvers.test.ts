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

const USER_QUERY = `
    query user($name: String) {
        user(name: $name) {
            pass
        }
    }
`

describe("resolvers", () => {
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
        const logResponse = await graphqlTestCall(LOG_QUERY, { path: "etl_2019_10_21_21_54_33.log" });

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

    it("user query", async () => {
        const userResponse = await graphqlTestCall(USER_QUERY, { name: "admin" });
        // console.log(userResponse)

        expect(userResponse).toBeDefined();
        expect(userResponse).not.toBeNull();

        if (userResponse.errors) {
            console.error(userResponse);
            return
        }

        expect(userResponse.data).toBeDefined();
        expect(userResponse.data.user).toBeDefined();
        expect(userResponse.data.user).not.toBeNull();
        expect(userResponse.data.user.pass).not.toBeNull();

    }, 2000);
});