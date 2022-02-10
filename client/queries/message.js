import {gql} from "@apollo/client";

export const READ_MESSAGE = gql`
    mutation {
        readMessage
    }
`

export const GET_MESSAGES = gql`
    query {
        getMessages {
            from 
            to 
            text
        }
    }
`