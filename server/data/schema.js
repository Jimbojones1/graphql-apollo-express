import { resolvers } from './resolvers';
import { ApolloServer } from 'apollo-server-express';
const typeDefs = `

  type Dog {
    id: ID
    firstName: String
    lastName: String
    gender: Gender
    email: String
    age: Int
    parents: [Parent]
  }

  type Parent {
    firstName: String
    lastName: String
  }

  type Query {
    getOneDog(id: ID!): Dog
    getDogs: [Dog]
  }

  enum Gender {
    MALE
    FEMALE
  }

  input ParentInput {
    firstName: String
    lastName: String
  }

  input DogInput {
    id: ID
    firstName: String
    lastName: String
    gender: Gender
    email: String
    age: Int
    parents: [ParentInput]
  }

  type Mutation {
    createDog(input: DogInput): Dog
    updateDog(input: DogInput): Dog
    deleteDog(id: ID!): String
  }
`;

const GraphqlServer = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  playground: {
    endpoint: `http://localhost:4000/graphql`,
    setting: {
      'editor.theme': 'light'
    }
  }
});

export default GraphqlServer;
