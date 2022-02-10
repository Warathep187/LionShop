import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Cookie from "js-cookie";

const httpLink = createHttpLink({
    uri: "http://localhost:8000/graphql",
});

const authLink = setContext(() => {
    const token = Cookie.get("token") || null;
    return {
        headers: {
            token: `Bearer ${token}`,
        },
    };
});

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
});

export default client;