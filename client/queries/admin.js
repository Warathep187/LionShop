import { gql } from "@apollo/client";

export const CATEGORIES = gql`
    query {
        categories {
            _id
            category
            products
            createdAt
        }
    }
`;

export const CREATE_CATEGORY = gql`
    mutation ($input: CreateCategoryInput!) {
        createCategory(input: $input) {
            _id
            category
            products
            createdAt
        }
    }
`;

export const UPDATE_CATEGORY = gql`
    mutation ($input: CategoryUpdateInput!) {
        updateCategory(input: $input)
    }
`;

export const DELETE_CATEGORY = gql`
    mutation ($input: ID!) {
        deleteCategory(input: $input)
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
            rating {
                sumPoint
                ratings
            }
            sold
        }
    }
`;

export const DELETE_PRODUCT = gql`
    mutation ($input: ID!) {
        deleteProduct(input: $input)
    }
`;

export const CREATE_PRODUCT = gql`
    mutation ($input: CreateProductInput!) {
        createProduct(input: $input)
    }
`;

export const ADMIN_GET_PAYMENTS = gql`
    query {
        adminGetPayments {
            _id
            user
            status {
                confirm
                cancel
            }
            createdAt
        }
    }
`;

export const ADMIN_GET_SPECIFIC_PAYMENT = gql`
    query ($paymentId: ID!) {
        adminGetSpecificPayment(paymentId: $paymentId) {
            _id
            status {
                confirm
                cancel
            }
            user
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

export const ADD_TRACKING_NUMBER = gql`
    mutation ($input: TrackingNumberInput!) {
        addTrackingNumber(input: $input)
    }
`;

export const SINGLE_PRODUCT_FOR_EDIT = gql`
    query ($productId: ID!) {
        singleProduct(productId: $productId) {
            _id
            name
            description
            category
            coverImage {
                url
            }
            images {
                url
                public_id
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
        }
    }
`;

export const REMOVE_IMAGE = gql`
    mutation ($input: RemoveImageInput!) {
        removeImage(input: $input)
    }
`;

export const ADMIN_GET_USER_PROFILE = gql`
    query ($userId: ID!) {
        adminGetUserProfile(userId: $userId) {
            email
            username
            profileImage {
                url
            }
        }
    }
`;

export const ADMIN_GET_USER_PAYMENTS = gql`
    query ($userId: ID!) {
        adminGetUserPayments(userId: $userId) {
            _id
            status {
                confirm
                cancel
            }
            createdAt
        }
    }
`;

export const ADMIN_GET_CONVERSATIONS = gql`
    query {
        adminGetConversations {
            _id
            user {
                _id
                username
                profileImage {
                    url
                }
            }
            lastMessageAt
            isRead
        }
    }
`;

export const ADMIN_GET_MESSAGES = gql`
    query ($conversationId: ID!) {
        adminGetMessages(conversationId: $conversationId) {
            from
            to
            text
        }
    }
`;

export const ADMIN_NEW_CHAT_USERS = gql`
    query {
        adminNewChatUsers {
            _id
            username
            profileImage {
                url
            }
        }
    }
`;

export const ADMIN_CREATE_NEW_CHAT = gql`
    mutation ($input: NewChatInputType!) {
        adminCreateNewChat(input: $input) {
            _id
            user {
                _id
                username
                profileImage {
                    url
                }
            }
            lastMessageAt
            isRead
        }
    }
`;

export const UPDATE_PRODUCT = gql`
    mutation ($input: UpdateProductInput!) {
        updateProduct(input: $input)
    }
`;
