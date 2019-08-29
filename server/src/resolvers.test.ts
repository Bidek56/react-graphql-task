import { graphqlTestCall } from "./graphqlTestCall";

const CREATE_TASK_MUTATION = `
    mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $blobs: BlobInput) {
        createTask(task: {status: $status, type: $type, time: $time, blobs: $blobs }) {
            status
        }
    }
`;

describe("resolvers", () => {
    it("mutation", async () => {

        const taskResponse = await graphqlTestCall(CREATE_TASK_MUTATION, {
            status: "Started",
            type: "Promo Table(s)",
            time: "1/1/2019"
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
});