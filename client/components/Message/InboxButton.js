import { useSelector, useDispatch } from "react-redux";
import { profileActions } from "../../store/index";
import { Icon } from "semantic-ui-react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { READ_MESSAGE } from "../../queries/message";

const InboxButton = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [readMessage] = useMutation(READ_MESSAGE, {
        update: (res, {data}) => {
            console.log(data);
            dispatch(profileActions.readMessage());
        },
        onError: (err) => console.log(err),
    });
    const [isHover, setIsHover] = useState(false);
    const { unreadMessage } = useSelector((state) => state.profileSlice);

    const readMessageHandler = () => {
        readMessage();
    };

    return (
        <a
            href="/inbox"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className={`p-4 rounded-circle bg-light border border-3 ${isHover ? "shadow" : ""}`}
            style={{
                position: "fixed",
                zIndex: "5",
                bottom: "30px",
                right: "30px",
                cursor: "pointer",
            }}
        >
            <Icon name="inbox" size="big" color="green" onClick={readMessageHandler} />
            {unreadMessage && (
                <span className="position-absolute translate-middle badge rounded-pill bg-danger p-2">
                    {" "}
                </span>
            )}
        </a>
    );
};

export default InboxButton;
