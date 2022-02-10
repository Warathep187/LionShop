import React from "react";
import Link from "next/link";

const LoginSignupNav = ({ children }) => {
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
                </div>
            </nav>

            {children}
        </>
    );
};

export default LoginSignupNav;
