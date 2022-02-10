import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CHANGE_PASSWORD } from "../../queries/user";
import { Form } from "semantic-ui-react";
import { toast } from "react-toastify";

const ChangePassword = ({setIsChange}) => {
    const [data, setData] = useState({
        password: "",
        confirm: "",
    });
    const { password, confirm } = data;
    const [isLoading, setIsLoading] = useState(false);

    const [changePassword] = useMutation(CHANGE_PASSWORD, {
        update: (res, {data}) => {
            toast(data.changePassword)
            setData({
                password: "",
                confirm: ""
            })
            setIsChange(false);
        },
        onError: (err) => toast.error(err.message)
    })

    const dataChangeHandler = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value,
        });
    };

    const changePasswordHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if(!password || password.trim() === "") {
            toast.error("Password must be provided")
        }else if(password.trim().length < 6) {
            toast.error("Password must be at least 6 characters")
        }else if(password !== confirm) {
            toast.error("Password does not match.")
        }else {
            await changePassword({
                variables: {
                    input: data
                }
            })
        }
        setIsLoading(false);
    }

    return (
        <div className="mt-3 border border-2 rounded-2 p-3 px-5 px-5 mx-auto w-50">
            <Form loading={isLoading} onSubmit={changePasswordHandler}>
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
                    <label htmlFor="confirm">Confirm New Password</label>
                    <input
                        type="password"
                        name="confirm"
                        id="confirm"
                        className="form-control"
                        value={confirm}
                        onChange={dataChangeHandler}
                    />
                </div>
                <div>
                    <button className="btn btn-outline-primary">
                        {isLoading ? "Changing" : "Change"}
                    </button>
                </div>
            </Form>
        </div>
    );
};

export default ChangePassword;
