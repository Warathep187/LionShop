import {gql} from "@apollo/client";

export const CATEGORIES_POPUP = gql`
    query {
        categories {
            _id
            category
        }
    }
`

export const GET_CATEGORY = gql`
    query ($category: String!) {
        getCategory (category: $category) {
            _id
            category
            products
        }
    }
`

export const PRODUCTS_IN_CATEGORY = gql`
    query ($categoryId: ID!) {
        productsInCategory (categoryId: $categoryId) {
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