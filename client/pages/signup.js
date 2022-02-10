import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import Cookie from "js-cookie";
import { Form, Button, Icon } from "semantic-ui-react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { SIGNUP, GET_LOGGED_IN_USER_INFO } from "../queries/auth";
import {useRouter} from "next/router";
import LoginSignupNav from "../components/Navs/LoginSignupNav";
import LoadingPage from "../components/LoadingPage";

const signup = () => {
    const router = useRouter();
    const {loading, data, error} = useQuery(GET_LOGGED_IN_USER_INFO);
    const [enteredData, setEnteredData] = useState({
        email: "",
        password: "",
        confirm: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const [signup] = useMutation(SIGNUP, {
        update: (res, { data }) => {
            setEnteredData({
                email: "",
                password: "",
                confirm: "",
            });
            toast(data.signup);
        },
        onError: (err) => toast.error(err.message),
    });

    const { email, password, confirm } = enteredData;

    if(loading) {
        return <LoadingPage />
    }

    if(data) {
        if(data.getLoggedInUserInfo.role === "admin") {
            router.replace("/admin/dashboard");
        }else {
            router.replace("/");
        }
        return <LoadingPage />
    }

    // useMemo(() => {
    //     const email = Cookie.get("email");
    //     if (email) {
    //         setEnteredData({
    //             ...enteredData,
    //             email,
    //         });
    //     }
    // }, []);

    const dataChangeHandler = (e) => {
        const { name, value } = e.target;
        setEnteredData({
            ...enteredData,
            [name]: value,
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!email || email.trim() === "") {
            toast.error("Email must be provided");
        } else if (
            !email.match(
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
            )
        ) {
            toast.error("Email is invalid");
        } else if (!password || password.trim() === "") {
            toast.error("Password must be provided");
        } else if (password.trim().length < 6) {
            toast.error("Password must be at least 6 characters");
        } else if (password !== confirm) {
            toast.error("Password does not match.");
        } else {
            await signup({
                variables: {
                    input: enteredData,
                },
            });
        }
        setIsLoading(false);
    };

    return (
        <>
            <div className="container-fluid" style={{ height: "684px" }}>
                <div
                    className="w-75 bg-light mx-auto rounded-2 shadow-sm"
                    style={{
                        height: "450px",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <div className="row">
                        <div className="col-6">
                            <img
                                src="https://lumiere-a.akamaihd.net/v1/images/tlk_listicle_1_62b7eec6.jpeg?region=0,0,1500,844"
                                alt="Image"
                                style={{ width: "100%", height: "450px", objectFit: "cover" }}
                            />
                        </div>
                        <div className="col-6 ps-4 pe-5 pt-4">
                            <h1 className="display-3">Signup</h1>
                            <Form loading={isLoading} onSubmit={submitHandler}>
                                <div className="form-group mt-5">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        className="form-control2"
                                        id="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        onChange={dataChangeHandler}
                                        value={email}
                                    />
                                </div>
                                <div className="form-group my-3">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        onChange={dataChangeHandler}
                                        value={password}
                                    />
                                </div>
                                <div className="form-group my-3">
                                    <label htmlFor="confirm">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirm"
                                        name="confirm"
                                        placeholder="Confirm your password"
                                        onChange={dataChangeHandler}
                                        value={confirm}
                                    />
                                </div>
                                <div className="d-flex align-items-center justify-content-end mt-3">
                                    <Button
                                        animated="vertical"
                                        className="px-4"
                                        color="yellow"
                                        disabled={isLoading}
                                    >
                                        <Button.Content visible>Signup</Button.Content>
                                        <Button.Content hidden>
                                            <Icon name="signup" />
                                        </Button.Content>
                                    </Button>
                                    <Link href="/login">
                                        <a className="text-decoration-none ms-3">
                                            Login
                                            <Icon name="arrow right" className="ms-1" />
                                        </a>
                                    </Link>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default signup;
