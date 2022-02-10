import { gql } from "@apollo/client";

export const COMMENT = gql`
    mutation ($input: CommentInputType!) {
        comment(input: $input)
    }
`;

export const GET_PRODUCT_COMMENTS = gql`
    query ($productId: ID!) {
        getProductComments(productId: $productId) {
            _id
            user {
                username
                profileImage {
                    url
                }
            }
            text
            rating
            createdAt
        }
    }
`