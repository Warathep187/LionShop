const {gql} = require("apollo-server-express");

module.exports = gql`
    input ProductTypesInput {
        type_: String!
        price: Int!
        amount: Int!
    }
    input ProductTypeInput {
        price: Int!
        amount: Int!
    }
    input CreateProductInput {
        name: String!
        description: String!
        coverImage: String!
        images: [String]!
        category: ID!
        multipleType: Boolean!
        types: [ProductTypesInput]!
        type: ProductTypeInput!
    }

    type ProductTypes {
        type_: String
        price: Int!
        amount: Int
    }
    type ProductType {
        price: Int!
        amount: Int
    }
    type Rating {
        sumPoint: Int!
        ratings: Int!
    }
    type ProductDataType {
        _id: ID!
        name: String!
        description: String
        category: ID!
        coverImage: Image
        images: [Image]
        multipleType: Boolean
        types: [ProductTypes]
        type: ProductType
        rating: Rating
        sold: Int
    }

    input RemoveImageInput {
        public_id: ID!
        productId: ID!
    }

    input UpdateProductInput {
        _id: ID!
        name: String!
        description: String!
        coverImage: String!
        images: [String]!
        category: ID!
        multipleType: Boolean!
        types: [ProductTypesInput]!
        type: ProductTypeInput!
    }

    type Query {
        recommendedProducts: [ProductDataType]!
        newProducts: [ProductDataType]!
        singleProduct(productId: ID!): ProductDataType!
        search(key: String!): [ProductDataType]!
        allProducts: [ProductDataType]!
    }
    type Mutation {
        createProduct(input: CreateProductInput!): String!
        deleteProduct(input: ID!): ID!
        removeImage(input: RemoveImageInput!): ID!
        updateProduct(input: UpdateProductInput!): String!
    }
`