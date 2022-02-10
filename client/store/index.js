import { createSlice, configureStore } from "@reduxjs/toolkit";

const initialProfileState = {
    _id: "",
    username: "",
    profileImage: {
        url: "https://racemph.com/wp-content/uploads/2016/09/profile-image-placeholder.png",
    },
    role: "",
    unreadMessage: false,
    unreadNotification: false,
};

const initialCartState = {
    items: [],
};

const profileSlice = createSlice({
    name: "Profile",
    initialState: initialProfileState,
    reducers: {
        setInitialProfile(state, action) {
            state._id = action.payload._id
            state.username = action.payload.username;
            state.profileImage = action.payload.profileImage;
            state.role = action.payload.role;
            state.unreadMessage = action.payload.unreadMessage;
            state.unreadNotification = action.payload.unreadNotification;
        },
        updateProfile(state, action) {
            state.username = action.payload.username;
            state.profileImage = action.payload.profileImage;
        },
        setUnreadNotification(state, action) {
            state.unreadNotification = true;
        },
        readNotification(state, action) {
            state.unreadNotification = false;
        },
        setUnreadMessage(state, action) {
            state.unreadMessage = true;
        },
        readMessage(state, action) {
            console.log(false)
            state.unreadMessage = false;
        },
        removeProfile(state, action) {
            state = {
                username: "",
                profileImage: {
                    url: "https://racemph.com/wp-content/uploads/2016/09/profile-image-placeholder.png",
                },
                unreadMessage: false,
                unreadNotification: false,
            };
        },
    },
});

const cartSlice = createSlice({
    name: "Cart",
    initialState: initialCartState,
    reducers: {
        setInitialCart(state, action) {
            state.items = action.payload;
        },
        addToCart(state, action) {
            const index = state.items.findIndex((item) => item._id === action.payload._id);
            if (index === -1) {
                state.items = [...state.items, action.payload];
            }
        },
        remove(state, action) {
            const filtered = state.items.filter((val) => val._id !== action.payload);
            state.items = filtered;
        },
        removeSpecificItems(state, action) {
            const filtered = state.items.filter((val) => !action.payload.includes(val._id));
            state.items = filtered;
        }
    },
});

const store = configureStore({
    reducer: {
        profileSlice: profileSlice.reducer,
        cartSlice: cartSlice.reducer,
    },
});

export default store;
export const profileActions = profileSlice.actions;
export const cartAction = cartSlice.actions;
