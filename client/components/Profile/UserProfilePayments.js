import React from "react";
import { useQuery } from "@apollo/client";
import { ADMIN_GET_USER_PAYMENTS } from "../../queries/admin";
import LoadingPage from "../../components/LoadingPage";
import moment from "moment";
import Link from "next/link";

const UserProfilePayments = ({ userId }) => {
    const { loading, data, error } = useQuery(ADMIN_GET_USER_PAYMENTS, {
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

    const confirmOrCancel = ({ confirm, cancel }) => {
        if (confirm) {
            return <p className="fw-bold text-success">Confirmed</p>;
        } else if (cancel) {
            return <p className="fw-bold text-danger">Canceled</p>;
        } else {
            return <p className="fw-bold text-warning">Waiting..</p>;
        }
    };

    return (
        <div className="container">
            <table className="table table-light table-striped w-50 mx-auto">
                <thead>
                    <tr>
                        <th scope="col">Order No.</th>
                        <th scope="col">Ordered At</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.adminGetUserPayments.map((payment) => (
                        <tr key={payment._id}>
                            <td>{payment._id}</td>
                            <td>{moment(payment.createdAt).format("Do MMMM YYYY, h:mm:ss")}</td>
                            <td>{confirmOrCancel(payment.status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserProfilePayments;
