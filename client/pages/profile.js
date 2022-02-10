import {useState} from "react";
import { useQuery } from "@apollo/client";
import { GET_PROFILE } from "../queries/user";
import LoadingPage from "../components/LoadingPage";
import Profile from "../components/Profile/Profile";
import ChangePassword from "../components/Profile/ChangePassword";

const profile = () => {
    const { loading, data, error } = useQuery(GET_PROFILE);
    const [isChange, setIsChange] = useState(false);

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div className="container px-5">
            <p className="display-4 mb-1">Your Profile</p>
            <hr />
            <div className="container">
                <Profile profileData={data.getProfile} isChange={isChange} setIsChange={setIsChange} />
            </div>
            {isChange && <ChangePassword setIsChange={setIsChange} />}
        </div>
    );
};

export default profile;
