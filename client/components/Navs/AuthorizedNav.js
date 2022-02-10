import { useState, useEffect } from "react";
import { Menu } from "semantic-ui-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Popup, Image, Header, Icon, Modal } from "semantic-ui-react";
import CategoriesPopup from "../Category/CategoriesPopup";
import Cookie from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { profileActions } from "../../store/index";
import SearchNav from "../Search/SearchNav";
import { useMutation } from "@apollo/client";
import CartButton from "../Cart/CartButton";
import { READ_NOTIFICATION } from "../../queries/user";
import InboxButton from "../Message/InboxButton";
import socket from "../../utils/socketIOClient";

//const alert = new Audio("/static/sound/alert.mp3");

const AuthorizedNav = ({ children }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { _id, username, profileImage, unreadNotification } = useSelector(
        (state) => state.profileSlice
    );

    const [readNotification] = useMutation(READ_NOTIFICATION, {
        update: (res, { data }) => {
            dispatch(profileActions.readNotification());
            router.push("/notification");
        },
        onError: (err) => console.log(err),
    });

    useEffect(() => {
        if (socket) {
            socket.emit("join", { _id });
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.on("receiveMessage", () => {
                if (router.pathname !== "/inbox") {
                    //alert.play();
                    dispatch(profileActions.setUnreadMessage());
                }
            });
            socket.on("newNotification", () => {
                //alert.play();
                dispatch(profileActions.setUnreadNotification());
            });
        }
    }, [socket, router.pathname]);

    const logoutHandler = () => {
        Cookie.remove("token");
        dispatch(profileActions.removeProfile());
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link href="/">
                        <a className="navbar-brand">
                            <img
                                src="/static/image/logo.png"
                                style={{ width: "100%", height: "55px", objectFit: "cover" }}
                            />
                        </a>
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex align-items-center w-100">
                            <li className="nav-item ms-3">
                                <Popup trigger={<Button>Categories</Button>} flowing hoverable>
                                    <CategoriesPopup />
                                </Popup>
                            </li>
                            <li className="nav-item mx-auto">
                                <SearchNav />
                            </li>
                            <li className="nav-item ms-3">
                                <CartButton />
                            </li>
                            <li className="nav-item ms-3">
                                <Link href="/payment">
                                    <a className="nav-link">Payment</a>
                                </Link>
                            </li>
                            <li className="nav-item ms-3">
                                <Icon
                                    name="bell"
                                    size="big"
                                    color="red"
                                    className="position-relative"
                                    onClick={readNotification}
                                    style={{ cursor: "pointer" }}
                                >
                                    {unreadNotification && (
                                        <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"></span>
                                    )}
                                </Icon>
                            </li>
                            <li className="nav-item ms-3">
                                <Link href="/profile">
                                    <a className="nav-link d-flex align-items-center">
                                        <img
                                            src={profileImage.url}
                                            alt="Profile"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <span className="fw-bold ms-1">{username}</span>
                                    </a>
                                </Link>
                            </li>
                            <li className="nav-item ms-3">
                                <a
                                    className={`nav-link`}
                                    style={{ cursor: "pointer" }}
                                    onClick={logoutHandler}
                                    href="/login"
                                >
                                    Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            {children}
            {router.pathname !== "/inbox" && <InboxButton />}
        </>
    );
};

export default AuthorizedNav;
