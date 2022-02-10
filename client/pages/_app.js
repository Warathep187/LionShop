import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import "semantic-ui-css/semantic.min.css";
import { ApolloProvider } from "@apollo/client";
import { Provider } from "react-redux";
import store from "../store/index";
import client from "../apollo-client";
import Nav from "../components/Navs/Nav";

function MyApp({ Component, pageProps }) {
    return (
        <ApolloProvider client={client}>
            <Provider store={store}>
                <Head>
                    <link
                        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
                        rel="stylesheet"
                        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
                        crossOrigin="anonymous"
                    />
                    <script
                        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                        crossOrigin="anonymous"
                    ></script>
                </Head>
                <ToastContainer position="top-right" autoClose={3000} pauseOnFocusLoss={false} />
                <Nav>
                    <Component {...pageProps} />
                </Nav>
            </Provider>
        </ApolloProvider>
    );
}

export default MyApp;
