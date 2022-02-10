const {gql} = require("apollo-server-express");

module.exports = gql`
    type ConversationType {
        _id: ID!
        user: UserProfileType!
        lastMessageAt: DateTime!
        isRead: Boolean!
    }

    type MessageType {
        from: ID!
        to: ID!
        text: String
    }

    input NewChatInputType {
        userId: ID!
    }

    type Query {
        getMessages: [MessageType]!
        adminGetConversations: [ConversationType]!
        adminGetMessages(conversationId: ID!): [MessageType]!
        adminNewChatUsers: [UserProfileType]!
    }
    type Mutation {
        adminCreateNewChat(input: NewChatInputType!): ConversationType!
    }
`