const { gql } = require("apollo-server-express");

module.exports = gql`
    input SignupType {
        email: String!
        password: String!
        confirm: String!
    }
    input LoginType {
        email: String!
        password: String!
    }
    type Image {
        _id: ID!
        url: String
        public_id: String
    }
    type LoginResponseType {
        _id: ID!
        token: String!
        username: String!
        profileImage: Image!
        role: String!
        unreadMessage: Boolean!
        unreadNotification: Boolean!
    }

    input SendOTPInput {
        email: String!
    }
    input ResetPasswordInput {
        email: String!
        password: String!
        confirm: String!
        otp: String!
    }

    type Query {
        checkUserIsLoggedIn: Boolean!
        getLoggedInUserInfo: LoginResponseType!
    }
    type Mutation {
        signup(input: SignupType!): String!
        login(input: LoginType!): LoginResponseType!
        verify(token: String!): String!
        sendOTP(input: SendOTPInput!): String!
        resetPassword(input: ResetPasswordInput!): String!
    }
`;
