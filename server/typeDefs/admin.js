const { gql } = require("apollo-server-express");

module.exports = gql`
    input AdminUpdateProfileInput {
        username: String!
        image: String
    }
    input TrackingNumberInput {
        paymentId: ID!
        trackingNumber: String!
    }

    type Query {
        checkIsAdmin: LoginResponseType
        adminGetPayments: [PaymentsType]!
        adminGetSpecificPayment(paymentId: ID!): SpecificPayment!
        adminGetUserProfile(userId: ID!): UserProfileType!
        adminGetUserPayments(userId: ID!): [PaymentsType]!
    }
    type Mutation {
        addTrackingNumber(input: TrackingNumberInput!): ID!
    }
`;
