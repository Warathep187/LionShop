import React from "react";
import AuthorizedNav from "./AuthorizedNav";
import UnauthorizedNav from "./UnauthorizedNav";
import AdminTopNav from "../Navs/AdminTopNav";
import LoginSignupNav from "../Navs/LoginSignupNav";
import { GET_LOGGED_IN_USER_INFO } from "../../queries/auth";
import { useQuery } from "@apollo/client";
import { useDispatch } from "react-redux";
import { profileActions } from "../../store/index";
import LoadingPage from "../LoadingPage";
import { useRouter } from "next/router";

let isFetched = false;

const Nav = ({ children }) => {
    const router = useRouter();
    if (router.pathname === "/login" || router.pathname === "/signup") {
        return <LoginSignupNav>{children}</LoginSignupNav>;
    }

    const { loading, data, error } = useQuery(GET_LOGGED_IN_USER_INFO);
    const dispatch = useDispatch();

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <UnauthorizedNav>{children}</UnauthorizedNav>;
    }

    if (data && data.getLoggedInUserInfo.role === "user") {
        if (!isFetched) {
            dispatch(profileActions.setInitialProfile(data.getLoggedInUserInfo));
        }
        isFetched = true;
        return <AuthorizedNav>{children}</AuthorizedNav>;
    } else if (data && data.getLoggedInUserInfo.role === "admin") {
        if (!isFetched) {
            dispatch(profileActions.setInitialProfile(data.getLoggedInUserInfo));
        }
        isFetched = true;
        return <AdminTopNav>{children}</AdminTopNav>;
    }
};

export default Nav;
