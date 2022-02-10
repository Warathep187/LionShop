import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { Form } from "semantic-ui-react";
import imageResizer from "../../utils/imageResizer";
import { UPDATE_PROFILE } from "../../queries/user";
import { useDispatch } from "react-redux";
import { profileActions } from "../../store/index";

const Profile = ({ profileData, isChange, setIsChange }) => {
    const dispatch = useDispatch();
    const [enteredData, setEnteredData] = useState({
        username: profileData.username,
        image: "",
    });
    const [imagePreview, setImagePreview] = useState(profileData.profileImage.url);
    const [updateProfile] = useMutation(UPDATE_PROFILE, {
        update: (res, { data }) => {
            toast("Updated");
            dispatch(profileActions.updateProfile(data.updateProfile));
            setEnteredData({
                ...enteredData,
                image: "",
            });
        },
        onError: (err) => toast.error(err.message),
    });
    const [isLoading, setIsLoading] = useState(false);

    const imageChangeHandler = async (e) => {
        try {
            const file = e.target.files[0];
            const image = await imageResizer(file, 300, 300);
            setEnteredData({ ...enteredData, image });
            setImagePreview(URL.createObjectURL(file));
        } catch (e) {
            toast.error(e.message);
        }
    };

    const updateProfileHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (enteredData.username.trim() === "") {
            toast.error("Username is required");
        } else {
            await updateProfile({
                variables: {
                    input: enteredData,
                },
            });
        }
        setIsLoading(false);
    };

    return (
        <Form loading={isLoading} onSubmit={updateProfileHandler}>
            <div className="d-flex align-items-center px-5 w-75 mx-auto">
                <div className="mt-2 mb-3">
                    <img
                        src={imagePreview}
                        alt="Profile Image"
                        style={{
                            width: "220px",
                            height: "220px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            marginBottom: "1.5rem",
                        }}
                    />
                    <input type="file" className="form-control" onChange={imageChangeHandler} />
                </div>
                <div className="ms-4 w-100">
                    <div className="mb-2">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={profileData.email}
                            readOnly
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={enteredData.username}
                            onChange={(e) =>
                                setEnteredData({ ...enteredData, username: e.target.value })
                            }
                        />
                    </div>
                    <div className="text-end">
                        <button
                            className="btn btn-outline-warning px-2 me-2"
                            onClick={() => setIsChange(!isChange)}
                            type="button"
                        >
                            {isChange ? "Cancel": "Change Password"}
                        </button>
                        <button
                            className="btn btn-outline-primary px-4"
                            disabled={isLoading || !enteredData.username}
                        >
                            {isLoading ? "Updating.." : "Update"}
                        </button>
                    </div>
                </div>
            </div>
        </Form>
    );
};

export default Profile;
