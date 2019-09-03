import { graphql, GraphQLSchema } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

const schema: GraphQLSchema = makeExecutableSchema({ typeDefs, resolvers });

export const graphqlTestCall = async (
    query: any,
    variables?: any,
    userId?: number | string
) => {
    return graphql(
        schema,
        query,
        undefined,
        {
            req: {
                session: {
                    userId
                }
            },
            res: {
                clearCookie: () => { }
            }
        },
        variables
    );
};