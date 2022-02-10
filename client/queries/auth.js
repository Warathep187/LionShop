import {gql} from "@apollo/client";

export const LOGIN = gql`
    mutation login($input: LoginType!) {
        login(input: $input) {
            token
            username
            profileImage {
                url
            }
            role
            unreadMessage
            unreadNotification
        }
    }
`

export const SIGNUP = gql`
    mutation signup($input: SignupType!) {
        signup(input: $input)
    }
`

export const GET_LOGGED_IN_USER_INFO = gql`
    query {
        getLoggedInUserInfo {
            _id
            username
            profileImage {
                url
            }
            role
            unreadMessage
            unreadNotification
        }
    }
`

export const VERIFY = gql`
    mutation verify($token: String!) {
        verify(token: $token)
    }
`

export const CHECK_IS_ADMIN = gql`
    query {
        checkIsAdmin {
            _id
            username
            profileImage {
                url
            }
            role
            unreadMessage
            unreadNotification
        }
    }
`

export const SEND_OTP = gql`
    mutation ($input: SendOTPInput!) {
        sendOTP(input: $input)
    }
`

export const RESET_PASSWORD = gql`
    mutation ($input: ResetPasswordInput!) {
        resetPassword(input: $input)
    }
`