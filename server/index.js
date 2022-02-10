const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});
const {
    addUser,
    checkUserIsOnline,
    confirmOrder,
    checkIsAdmin,
} = require("./utils/paymentRealtimeActions");
const { checkRole, sendMessageToUser, sendMessageToAdmin } = require("./utils/chatRealtimeActions");
const {removeOnlineUserCache} = require("./utils/redisActions");

const { ApolloServer } = require("apollo-server-express");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");

app.use(cors());
app.use(bodyParser.json({ limit: "3mb" }));

io.on("connection", (socket) => {
    socket.on("join", async (user) => {
        console.log("user connected");
        await addUser(user._id, socket.id);
    });
    socket.on("actionsInOrder", async ({ userId, type, orderId, _id }) => {
        const isAdmin = await checkIsAdmin(_id);
        if (!isAdmin) {
            return io.to(socket.id).emit("error", "Error");
        }
        const isError = await confirmOrder(orderId, type, userId);
        if (isError) {
            return io.to(socket.id).emit("error", isError);
        }
        const isOnline = await checkUserIsOnline(userId);
        if (isOnline) {
            io.to(isOnline).emit("newNotification");
        }
        if (type === "confirm") {
            io.to(socket.id).emit("confirmedOrder");
        } else if (type === "cancel") {
            io.to(socket.id).emit("canceledOrder");
        }
    });
    socket.on("sendMessage", async ({ _id, message, toUser }) => {
        const userOrAdmin = await checkRole(_id);
        if (!userOrAdmin || userOrAdmin === "Error") {
            return io.to(socket.id).emit("error", "Something went wrong");
        }
        if (userOrAdmin === "admin") {
            const result = await sendMessageToUser({ _id, message, toUser });
            if (result === "Error") {
                io.to(socket.id).emit("error", "Something went wrong");
            } else if (result === "OK") {
                io.to(socket.id).emit("sentMessage");
            } else {
                io.to(socket.id).emit("sentMessage");
                io.to(result).emit("receiveMessage", { message, from: _id, to: toUser });
            }
        } else if (userOrAdmin === "user") {
            const result = await sendMessageToAdmin({ _id, message });
            if (result === "Error") {
                io.to(socket.id).emit("error", "Something went wrong");
            } else if (result === "OK") {
                io.to(socket.id).emit("sentMessage");
            } else {
                io.to(socket.id).emit("sentMessage");
                console.log(result.conversation);
                io.to(result.socketId).emit("receiveMessage", {
                    conversationInfo: result.conversation,
                    socketId: result.socketId,
                    message
                });
            }
        }
    });
    socket.on("disconnect", async () => {
        await removeOnlineUserCache(socket.id);
        console.log("Disconnected");
    });
});

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
        .connect(process.env.MONGODB_CONNECTION_PROD, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.log(err));
};
startApolloServer();

server.listen(process.env.PORT, () => console.log("listening on port " + process.env.PORT));
