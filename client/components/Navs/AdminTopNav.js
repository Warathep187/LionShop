import { useEffect } from "react";
import { CHECK_IS_ADMIN } from "../../queries/auth";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { profileActions } from "../../store/index";
import Link from "next/link";
import Cookie from "js-cookie";
import AdminLeftNav from "./AdminLeftNav";
import LoadingPage from "../LoadingPage";
import socket from "../../utils/socketIOClient";

let isSet = false;

const AdminTopNav = ({ children }) => {
    const { loading, data, error } = useQuery(CHECK_IS_ADMIN);
    const dispatch = useDispatch();
    const router = useRouter();
    const { _id, username, profileImage, unreadMessage } = useSelector(
        (state) => state.profileSlice
    );

    useEffect(() => {
        if (socket) {
            socket.emit("join", { _id });
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("receiveMessage", () => {
                if (router.pathname !== "/admin/inbox") {
                    //alert.play();
                    dispatch(profileActions.setUnreadMessage());
                }
            });
        }
    }, [socket, router.pathname]);

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        router.replace("/login");
        return <p>{error.message}</p>;
    }

    if (!loading && data && data.checkIsAdmin.role === "admin" && !isSet) {
        dispatch(profileActions.setInitialProfile(data.checkIsAdmin));
        isSet = true;
    }

    const logoutHandler = () => {
        Cookie.remove("token");
        dispatch(profileActions.removeProfile());
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white">
                <div className="container-fluid">
                    <Link href="/admin/dashboard">
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
                            <li className="nav item mx-auto"></li>
                            <li className="nav-item ms-2">
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
            {router.pathname !== "/admin/inbox" ? (
                <AdminLeftNav _id={_id} unreadMessage={unreadMessage}>
                    {children}
                </AdminLeftNav>
            ) : (
                <div className="container">{children}</div>
            )}
        </>
    );
};

export default AdminTopNav;
