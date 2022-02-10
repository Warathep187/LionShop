import React from "react";
import { useQuery } from "@apollo/client";
import { ADMIN_GET_USER_PROFILE } from "../../queries/admin";
import LoadingPage from "../../components/LoadingPage";

const UserProfile = ({ userId }) => {
    const { loading, data, error } = useQuery(ADMIN_GET_USER_PROFILE, {
        variables: {
            userId,
        },
    });

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div className="container px-5">
            <div className="mx-auto d-flex align-items-center justify-content-center mb-4 w-75">
                <div>
                    <img
                        src={data.adminGetUserProfile.profileImage.url}
                        alt="Profile"
                        style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                </div>
                <div className="ms-4">
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control"
                            style={{width: "25rem"}}
                            id="floatingInput1"
                            readOnly
                            value={data.adminGetUserProfile.email}
                        />
                        <label htmlFor="floatingInput1">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            style={{width: "25rem"}}
                            id="floatingInput2"
                            readOnly
                            value={data.adminGetUserProfile.username}
                        />
                        <label htmlFor="floatingInput2">Username</label>
                    </div>
                </div>
            </div>
            <hr />
        </div>
    );
};

export default UserProfile;
