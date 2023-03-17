const { request, gql } = require('graphql-request')

const query = gql`
  {
    movies {
    peopleActedInAggregate {
      count
    }
    title
  }
  }
`
request('http://localhost:4000/', query).then((data) => console.log(data))