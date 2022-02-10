const {gql} = require("apollo-server-express");

module.exports = gql`
    input CreatePaymentInput {
        fullName: String!
        address: String!
        tel: String!
        image: String!
        productList: [ID!]!
    }

    type PaymentProductType {
        _id: ID!
        coverImage: Image!
        name: String!
    }
    type Status {
        confirm: Boolean!
        cancel: Boolean!
    }
    type ProductInPaymentType {
        product: PaymentProductType!
        type_: String
        price: Int!
        amount: Int!
        isReviewed: Boolean!
    }
    type PaymentsType {
        _id: ID!
        user: ID!
        status: Status!
        createdAt: DateTime!
    }
    type SpecificPayment {
        _id: ID!
        user: ID
        status: Status!
        products: [ProductInPaymentType!]!
        slipImage: Image!
        fullName: String!
        address: String!
        tel: String!
        trackingNumber: String!
        createdAt: DateTime!
        reviewExpirationTime: DateTime
    }

    input PaymentIdInput {
        paymentId: ID!
    }

    type Query {
        getPayments: [PaymentsType]!
    }
    type Mutation {
        createPayment(input: CreatePaymentInput!): String!
        getSpecificPayment(input: PaymentIdInput!): SpecificPayment!
    }
`