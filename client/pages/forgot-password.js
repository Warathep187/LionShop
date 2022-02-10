import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SEND_OTP, RESET_PASSWORD } from "../queries/auth";
import { Form } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const ForgotPassword = () => {
    const router = useRouter();
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [enteredData, setEnteredData] = useState({
        email: "",
        password: "",
        confirm: "",
        otp: "",
    });

    const { email, password, confirm, otp } = enteredData;
    const [sendOTP] = useMutation(SEND_OTP, {
        update: (res, { data }) => {
            toast(data.sendOTP);
            setIsSent(true);
        },
        onError: (err) => toast.error(err.message),
    });
    const [resetPassword] = useMutation(RESET_PASSWORD, {
        update: (res, { data }) => {
            toast(data.resetPassword);
            router.push("/login");
        },
        onError: (err) => toast.error(err.message),
    });

    const dataChangeHandler = (e) => {
        const { name, value } = e.target;
        setEnteredData({
            ...enteredData,
            [name]: value,
        });
    };

    const sendOTPHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (
            !email.match(
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
            )
        ) {
            toast.error("Email is invalid");
        } else {
            await sendOTP({
                variables: {
                    input: {
                        email,
                    },
                },
            });
        }
        setIsLoading(false);
    };

    const resetPasswordHandler = async (e) => {
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
        } else if (otp.length !== 6 || isNaN(parseInt(otp))) {
            toast.error("OTP is invalid format");
        } else {
            await resetPassword({
                variables: {
                    input: enteredData,
                },
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="container">
            <p className="display-3 mb-1">Reset Password</p>
            <hr />
            <div className="w-50 mx-auto">
                <Form loading={isLoading} onSubmit={isSent ? resetPasswordHandler : sendOTPHandler}>
                    <div className="form-group mb-2">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={dataChangeHandler}
                        />
                    </div>
                    <div className="mb-3 text-end">
                        {!isSent && <button className="btn btn-outline-primary px-4">{isLoading ? "Sending": "Send"}</button>}
                    </div>
                    {isSent && (
                        <div>
                            <div className="form-group mb-2">
                                <label htmlFor="password">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="form-control"
                                    value={password}
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <div className="form-group mb-2">
                                <label htmlFor="password">Confirm your Password</label>
                                <input
                                    type="confirm"
                                    name="confirm"
                                    id="confirm"
                                    className="form-control"
                                    value={confirm}
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <div className="form-group mb-2">
                                <label htmlFor="otp">OTP</label>
                                <input
                                    type="otp"
                                    name="otp"
                                    id="otp"
                                    className="form-control"
                                    value={otp}
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <div className="text-end">
                                <button className="btn btn-outline-primary px-3">{isLoading ? "Resetting..": "Reset"}</button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
};

export default ForgotPassword;
