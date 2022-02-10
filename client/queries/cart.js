import { gql } from "@apollo/client";

export const GET_CART_ITEMS = gql`
    query {
        cart {
            _id
        }
    }
`;

export const GET_ALL_ITEMS_IN_CART = gql`
    query {
        cart {
            _id
            product {
                _id
                name
                coverImage {
                    url
                }
                multipleType
            }
            type_
            price
            amount
        }
    }
`;

export const ADD_TO_CART = gql`
    mutation ($input: CartInput!) {
        addToCart(input: $input) {
            _id
        }
    }
`;

export const REMOVE_ITEM = gql`
    mutation ($input: ID!) {
        removeItem(input: $input)
    }
`;

export const ITEM_INCREMENT = gql`
    mutation ($input: ID!) {
        itemIncrement(input: $input) {
            _id
        }
    }
`;

export const ITEM_DECREMENT = gql`
    mutation ($input: ID!) {
        itemDecrement(input: $input) {
            _id
        }
    }
`;

export const CHECKOUT = gql`
    mutation ($input: [ID!]!) {
        checkout(input: $input) {
            items {
                _id
                product {
                    _id
                    name
                }
                type_
                price
                amount
            }
            qrcode
        }
    }
`;
