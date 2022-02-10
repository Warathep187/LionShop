import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import LoginSignupNav from "../../components/Navs/LoginSignupNav";
import { VERIFY } from "../../queries/auth";
import { toast } from "react-toastify";
import { Button, Form } from "semantic-ui-react";

const VerifyPage = () => {
    const router = useRouter();
    const [verify] = useMutation(VERIFY, {
        update: (res, { data }) => {
            setIsVerified(true);
            toast(data.verify);
        },
        onError: (err) => toast.error(err.message),
    });
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const verifyAccount = async () => {
        setIsLoading(true);
        await verify({
            variables: {
                token: router.query.token,
            },
        });
        setIsLoading(false);
    };

    return (
        <>
            <div className="container">
                <div className="card mx-auto mt-5" style={{ width: "35rem" }}>
                    <div className="card-body p-5">
                        <div className="card-title display-5">Verify account</div>
                        <p className="card-text fs-4">
                            Please click below button to verify your account.
                        </p>
                        <Form loading={isLoading}>
                            <Button
                                basic
                                color="yellow"
                                className="w-50"
                                content={isVerified ? "Verified" : "Verify"}
                                disabled={isVerified || isLoading}
                                onClick={verifyAccount}
                            />
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyPage;
