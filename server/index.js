const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");

const { ApolloServer } = require("apollo-server-express");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");

app.use(cors());
app.use(bodyParser.json({ limit: "3mb" }));

const typeDefs = mergeTypeDefs(loadFilesSync("./typeDefs"));
const resolvers = mergeResolvers(loadFilesSync(path.join("./resolvers")));

const startApolloServer = async () => {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }) => ({ req, res }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    mongoose
        .connect(process.env.MONGODB_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.log(err));
};
startApolloServer();

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
