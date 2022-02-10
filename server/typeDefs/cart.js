const { gql } = require("apollo-server-express");

module.exports = gql`
    type CartType {
        _id: ID!
        product: ProductDataType
        type_: String
        price: Int
        amount: Int
    }

    type CartInputType {
        _id: ID!
        product: ID!
        type_: String
        price: Int
        amount: Int
    }

    input CartInput {
        product: ID!
        type: String
        price: Int!
        amount: Int!
    }

    type CheckoutType {
        items: [CartType!]!
        qrcode: String!
    }

    type Query {
        cart: [CartType]!
    }
    type Mutation {
        addToCart(input: CartInput!): CartInputType!
        itemIncrement(input: ID!): CartInputType!
        itemDecrement(input: ID!): CartInputType!
        removeItem(input: ID!): ID!
        checkout(input: [ID!]!): CheckoutType!
    }
`;
