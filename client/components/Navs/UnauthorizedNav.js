import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import CategoriesPopup from "../Category/CategoriesPopup";
import { Popup, Button } from "semantic-ui-react";
import SearchNav from "../Search/SearchNav";

const UnauthorizedNav = ({ children }) => {
    const router = useRouter();
    const [current, setCurrent] = useState("");

    useEffect(() => {
        setCurrent(router.pathname);
    }, [router.pathname]);

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
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100">
                            <li className="nav-item">
                                <Popup trigger={<Button>Categories</Button>} flowing hoverable>
                                    <CategoriesPopup />
                                </Popup>
                            </li>
                            <div className="nav-item mx-auto">
                                <SearchNav />
                            </div>
                            <li className="nav-item">
                                <Link href="/login">
                                    <a
                                        className={`nav-link ${current === "/login" && "active"}`}
                                        aria-current="page"
                                    >
                                        Login
                                    </a>
                                </Link>
                            </li>
                            <li className="nav-item ms-2">
                                <Link href="/signup">
                                    <a className={`nav-link ${current === "/signup" && "active"}`}>
                                        Signup
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {children}
        </>
    );
};

export default UnauthorizedNav;
