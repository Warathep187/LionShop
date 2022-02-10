const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type CategoryType {
        _id: ID
        category: String!
        products: Int
        createdAt: DateTime
    }
    input CreateCategoryInput {
        category: String
    }

    input CategoryUpdateInput {
        categoryId: ID!
        category: String!
    }

    type CategoryPage {
        _id: ID!
        category: String!,
        products: Int!
    }

    type Query {
        getCategory(category: String!): CategoryPage!
        productsInCategory(categoryId: ID!): [ProductDataType]!
        categories: [CategoryType]!
    }
    type Mutation {
        createCategory(input: CreateCategoryInput!): CategoryType!
        updateCategory(input: CategoryUpdateInput!): ID!
        deleteCategory(input: ID!): ID!
    }
`;
