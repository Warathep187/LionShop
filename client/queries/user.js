import {gql} from "@apollo/client";

export const READ_NOTIFICATION = gql`
    mutation {
        readNotification
    }
`

export const GET_PROFILE = gql`
    query {
        getProfile {
            email
            username
            profileImage {
                url
            }
        }
    }
`

export const UPDATE_PROFILE = gql`
    mutation ($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
            username
            profileImage {
                url
            }
        }
    }
`

export const CHANGE_PASSWORD = gql`
    mutation ($input: ChangePasswordInput!) {
        changePassword(input: $input) 
    }
`