
import * as Hapi from 'hapi';

/*
import * as GraphQLJSON from 'graphql-type-json';

import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    GraphQLSchema
} from 'graphql';

query GetPeeps ($where: JSON) {
  person(where: $where) {
    name,
    age,
    isRegistered,
    tasks {
      description,
      dueDate
    }
  }
}
*/

export default function registerMiddleware(server: Hapi.Server) {
    return new Promise((resolve, reject) => {

/*
        const TaskObject = new GraphQLObjectType({
            name: 'Task',
            fields: {
                description: {
                    type: GraphQLString,
                    resolve(root, args, context) {
                        return 'some desc';
                    }
                },
                dueDate: {
                    type: GraphQLString,
                    resolve(root, args, context) {
                        return '2017-01-01 12:01:02';
                    }
                }
            }
        });

        const PersonObject = new GraphQLObjectType({
            name: 'Person',
            fields: {
                name: {
                    type: GraphQLString,
                    resolve(root, args, context) {
                        return 'test name';
                    }
                },
                age: {
                    type: GraphQLInt,
                    resolve(root, args, context) {
                        return 21;
                    }
                },
                isRegistered: {
                    type: GraphQLBoolean,
                    resolve(root, args, context) {
                        return false;
                    },
                },
                tasks: {
                    type: new GraphQLList(TaskObject),
                    resolve(root, args, context) {
                        return [
                            {description: 'Do first thing', dueDate: 'NOW!'},
                            {description: 'Thing 2', dueDate: 'Next Tuesday'}
                        ];
                    }
                }
            },
        });

        const query = new GraphQLObjectType({
            name: 'query',
            fields: {
                person: {
                    type: PersonObject,
                    args: {
                        where: { type: GraphQLJSON }
                    },
                    resolve(root, args, context) {
                        console.log('WHERE', args['where']);
                        return {};
                    }
                }
            }
        });

        const schema = new GraphQLSchema({
            query: query
        });

        server.register([
                Inert,
                RevApi,
                {
                    register: graphqlHapi,
                    options: {
                        path: '/api',
                        graphqlOptions: {
                            schema: schema,
                        },
                        route: {
                            cors: true
                        }
                    },
                },
                {
                    register: graphiqlHapi,
                    options: {
                        path: '/graphiql',
                        graphiqlOptions: {
                        endpointURL: '/api',
                        },
                    },
                }
            ], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
*/
    });
}
