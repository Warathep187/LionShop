import { gql } from "@apollo/client";

export const RECOMMENDED_PRODUCTS = gql`
    query {
        recommendedProducts {
            _id
            name
            coverImage {
                url
            }
            multipleType
            types {
                price
            }
            type {
                price
            }
            sold
            rating {
                sumPoint
                ratings
            }
        }
    }
`;

export const NEWS_PRODUCTS = gql`
    query {
        newProducts {
            _id
            name
            coverImage {
                url
            }
            multipleType
            types {
                price
            }
            type {
                price
            }
            sold
            rating {
                sumPoint
                ratings
            }
        }
    }
`;

export const ALL_PRODUCTS = gql`
    query {
        allProducts {
            _id
            name
            coverImage {
                url
            }
            multipleType
            types {
                price
            }
            type {
                price
            }
            sold
            rating {
                sumPoint
                ratings
            }
        }
    }
`

export const SINGLE_PRODUCT = gql`
    query ($productId: ID!) {
        singleProduct(productId: $productId) {
            _id
            name
            description
            coverImage {
                url
            }
            images {
                public_id
                url
            }
            multipleType
            types {
                type_
                price
                amount
            }
            type {
                price
                amount
            }
            sold
            rating {
                sumPoint
                ratings
            }
        }
    }
`;

export const PRODUCT_SEARCHBAR = gql`
    query ($key: String!) {
        search(key: $key) {
            _id
            name
        }
    }
`

export const PRODUCT_SEARCH = gql`
    query ($key: String!) {
        search(key: $key) {
            _id
            name
            coverImage {
                url
            }
            multipleType
            types {
                price
            }
            type {
                price
            }
            sold
            rating {
                sumPoint
                ratings
            }
        }
    }
`