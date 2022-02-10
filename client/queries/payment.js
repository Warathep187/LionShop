import { gql } from "@apollo/client";

export const CREATE_PAYMENT = gql`
    mutation ($input: CreatePaymentInput!) {
        createPayment(input: $input)
    }
`;

export const GET_PAYMENTS = gql`
    query {
        getPayments {
            _id
            status {
                confirm
                cancel
            }
            createdAt
        }
    }
`;

export const GET_SPECIFIC_PAYMENT = gql`
    mutation ($input: PaymentIdInput!) {
        getSpecificPayment(input: $input) {
            _id
            status {
                confirm
                cancel
            }
            products {
                product {
                    _id
                    name
                    coverImage {
                        url
                    }
                }
                type_
                price
                amount
                isReviewed
            }
            slipImage {
                url
            }
            fullName
            address
            tel
            trackingNumber
            createdAt
            reviewExpirationTime
        }
    } 
`;
