const {gql, ApolloServer} = require("apollo-server");
const {Neo4jGraphQL} = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");

const driver = neo4j.driver('bolt://my_neo4j_4_4:7687', neo4j.auth.basic('neo4j', '12345678'));

const typeDefs = gql`
    interface AtProperties @relationshipProperties {
        eta_dp: Date!
        eta_lp: Date!
        etb_dp: Date!
        etb_lp: Date!
        etd_dp: Date!
        etd_lp: Date!
        opening: Date!
    }
    
    type Order {
        atPorts: [Port!]!
        @relationship(type: "AT", direction: OUT, properties: "AtProperties")
        code: String!
        gmt: Float!
        month_lp: Date!
        order_id: Float!
        qty: Float!
        test: Int! @cypher(statement: """
            MATCH (this)<-[r:HAS_ORDER]-(vo:Voyage)
            RETURN vo.voyage
            """ 
        )
        species: String!
        supplier: String!
        terms: String!
        voyagesHasOrder: [Voyage!]! @relationship(type: "HAS_ORDER", direction: IN)
    }
    
    type Port {
        ordersAt: [Order!]!
        @relationship(type: "AT", direction: IN, properties: "AtProperties")
        port_name: String!
    }
    
    type Voyage {
        code: String!
        hasOrderOrders: [Order!]! @relationship(type: "HAS_ORDER", direction: OUT)
        vessel: String!
        voyage: String!
        voyage_status: String!
    }

    type Query {
        distinctStatus : [String]!
        distinctVessel : [String]!
        distinctSupplier : [String]!
    }
`

const resolvers = {
    Query: {
        distinctVessel: async () => {
            const session = driver.session( {defaultAccessMode: neo4j.READ});
            const result = await session.run(`MATCH (v:Voyage) RETURN v.vessel;`)
            session.close();
            return result.records.map(record => record._fields[0])
        }
    }
};

const neoSchema = new Neo4jGraphQL({typeDefs, resolvers, driver});

neoSchema.getSchema().then((schema) => {
    const server = new ApolloServer({schema});
    server.listen().then(({url}) => {
        console.log(`Server ready at ${url}`);
    })
})