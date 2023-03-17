const { gql, ApolloServer } = require("apollo-server");
const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");

const fs = require('fs');

// Read the certificate file
const certFile = fs.readFileSync('C:/Program Files/OpenSSL-Win64/bin/neo4jcert.pem');

// Create a configuration object with the certificate file path
const config = {
  encrypted: true,
  //encryptedCertificate: certFileS
};

const driver = neo4j.driver(
    'bolt+ssc://localhost:7687',
    neo4j.auth.basic('neo4j', '12345678'),
);


// {trustedCertificates: ['C:\Program Files\OpenSSL-Win64\bin\neo4jcert.pem']}

const typeDefs = gql`
  interface ActedInProperties @relationshipProperties {
      roles: [String]!
    }
    
    type Movie {
      peopleActedIn: [Person!]!
        @relationship(
          type: "ACTED_IN"
          direction: IN
          properties: "ActedInProperties"
        )
      peopleDirected: [Person!]! @relationship(type: "DIRECTED", direction: IN)
      peopleProduced: [Person!]! @relationship(type: "PRODUCED", direction: IN)
      peopleReviewed: [Person!]!
        @relationship(
          type: "REVIEWED"
          direction: IN
          properties: "ReviewedProperties"
        )
      peopleWrote: [Person!]! @relationship(type: "WROTE", direction: IN)
      released: BigInt!
      tagline: String
      title: String!
    }
    
    type Person {
      actedInMovies: [Movie!]!
        @relationship(
          type: "ACTED_IN"
          direction: OUT
          properties: "ActedInProperties"
        )
      born: BigInt
      directedMovies: [Movie!]! @relationship(type: "DIRECTED", direction: OUT)
      followsPeople: [Person!]! @relationship(type: "FOLLOWS", direction: OUT)
      name: String!
      peopleFollows: [Person!]! @relationship(type: "FOLLOWS", direction: IN)
      producedMovies: [Movie!]! @relationship(type: "PRODUCED", direction: OUT)
      reviewedMovies: [Movie!]!
        @relationship(
          type: "REVIEWED"
          direction: OUT
          properties: "ReviewedProperties"
        )
      wroteMovies: [Movie!]! @relationship(type: "WROTE", direction: OUT)
    }
    
    type Query{
      me: String!
    }

    interface ReviewedProperties @relationshipProperties {
      rating: BigInt!
      summary: String!
    }  

`;

const resolvers = {
  Query: {
    me: () => 'Testing Resolver!',
  },
};

const neoSchema = new Neo4jGraphQL({typeDefs, resolvers, driver})

neoSchema.getSchema().then((schema) => {
    const server = new ApolloServer({
        schema,
    });
  
    server.listen().then(({ url }) => {
        console.log(`Server ready at ${url}`);
    });
  })

  

