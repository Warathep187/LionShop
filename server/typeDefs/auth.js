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
    type ProfileImageType {
        url: String!
        public_id: String!
    }
    type LoginResponseType {
        token: String!
        username: String!
        profileImage: ProfileImageType!
        role: String!
    }
    type LoggedInUserResponseType {
        username: String!
        profileImage: ProfileImageType!
    }
    type Query {
        getLoggedInUserInfo: LoggedInUserResponseType!
    }
    type Mutation {
        signup(input: SignupType!): String!
        login(input: LoginType!): LoginResponseType!
        verify(token: String!): String!
    }
`;
