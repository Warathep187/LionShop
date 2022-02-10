const {gql} = require("apollo-server-express");

module.exports = gql`
    type ProfileType {
        _id: ID
        username: String!
        profileImage: Image!
    }
    type CommentType {
        _id: ID!
        user: ProfileType!
        text: String!
        rating: Int!
        createdAt: DateTime!
    }
    input CommentInputType {
        text: String!
        rating: Int!
        orderId: ID!
        productId: ID!
    }
    type Query {
        getProductComments(productId: ID!): [CommentType]!
    }
    type Mutation {
        comment(input: CommentInputType!): String!
    }
`