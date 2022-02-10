import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
    query {
        getNotifications {
            _id
            orderId
            type
            createdAt
        }
    }
`;
