const { gql } = require("apollo-server-express");

module.exports = gql`
    type UpdateProfileResponse {
        username: String!
        profileImage: Image
    }
    input UpdateProfileInput {
        username: String!
        image: String
    }

    input ChangePasswordInput {
        password: String!
        confirm: String!
    }

    type UserProfileType {
        _id: ID
        email: String
        username: String
        profileImage: Image
    }

    type Query {
        getProfile: UserProfileType!
    }
    type Mutation {
        readNotification: String!
        readMessage: String!
        updateProfile(input: UpdateProfileInput!): UpdateProfileResponse!
        changePassword(input: ChangePasswordInput!): String!
    }
`;
