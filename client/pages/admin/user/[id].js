import React from "react";
import { useRouter } from "next/router";
import UserProfile from "../../../components/Profile/UserProfile";
import UserProfilePayments from "../../../components/Profile/UserProfilePayments"

const UserProfilePage = () => {
    const router = useRouter();

    return <div>
        <UserProfile userId={router.query.id} />
        <UserProfilePayments userId={router.query.id} />
    </div>;
};

export default UserProfilePage;
