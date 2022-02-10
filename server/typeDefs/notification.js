const {gql} = require("apollo-server-express");

module.exports = gql`
    type NotificationType {
        _id: ID
        orderId: ID!
        type: String!
        toUser: ID!
        createdAt: DateTime!
    }
    type Query {
        getNotifications: [NotificationType]!
    }
`