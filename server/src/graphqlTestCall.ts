import { graphql, GraphQLSchema, buildSchema } from "graphql";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

const schema: GraphQLSchema = buildSchema(typeDefs);

export const graphqlTestCall = async (source: any, variables?: any, token?: string) => {
    const ret = await graphql( {
        schema,
        source,
        rootValue: resolvers,
        contextValue: {
            req: {
                headers: {
                    authorization: 'Bearer ' + token
                },
            },
            res: {
                clearCookie: () => { }
            }
        },
        variableValues: variables
    });
    console.log("Ret:", ret)
    return ret;
};