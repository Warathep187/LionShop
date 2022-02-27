const { createClient } = require("redis");
const client = createClient(process.env.REDIS_URL);

const connectToRedis = async () => {
    await client.connect();
    console.log("Connected to Redis");
};
connectToRedis();

const getProductCache = async (productId) => {
    try {
        const product = await client.get(productId.toString());
        return product;
    } catch (e) {
    }
};

const deleteProductCache = async (productId) => {
    try {
        await client.del(productId.toString());
    } catch (e) {
    }
};

const setProductCache = async (product) => {
    try {
        await client.set(product._id.toString(), JSON.stringify(product), {
            EX: 60 * 60,
            NX: true,
        });
    } catch (e) {
    }
};

const getOnlineUsersCache = async () => {
    try {
        const users = await client.get("online");
        return JSON.parse(users);
    }catch(e) {
        throw new Error(e.message);
    }
}

const setNewOnlineUserCache = async ({userId, socketId}) => {
    try {
        const newOnlineUsers = [
            {
                socketId,
                userId,
            },
        ];
        await client.set("online", JSON.stringify(newOnlineUsers));
    }catch(e) {
        throw new Error(e.message);
    }
}

const setOnlineUserCache = async (currentOnlineUsers) => {
    try {
        await client.set("online", JSON.stringify(currentOnlineUsers));
    }catch(e) {
        throw new Error(e.message);
    }
}

const removeOnlineUserCache = async (socketId) => {
    try {
        const users = await getOnlineUsersCache();
        if(users) {
            const user = users.find(user => user.socketId === socketId);
            if(user) {
                const filtered = users.filter(user => user.socketId !== socketId)
                await client.set("online", JSON.stringify(filtered));
            }
        } 
    }catch(e) {
        throw new Error(e.message);
    }
}

module.exports = { getProductCache, deleteProductCache, setProductCache, getOnlineUsersCache, setNewOnlineUserCache, setOnlineUserCache, removeOnlineUserCache };
