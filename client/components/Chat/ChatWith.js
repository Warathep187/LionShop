import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { ADMIN_GET_MESSAGES } from "../../queries/admin";
import LoadingPage from "../LoadingPage";
import Messages from "../Message/Messages";
import { Icon } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import socket from "../../utils/socketIOClient";

let isFetched = false;
let conversationId = null;

const ChatWith = ({ conversation, refetchConversations, divRef, scrollToBottom }) => {
    const { _id } = useSelector((state) => state.profileSlice);
    const [message, setMessage] = useState("");
    const { loading, data, error, refetch } = useQuery(ADMIN_GET_MESSAGES, {
        variables: {
            conversationId: conversation._id,
        },
    });

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        divRef.current && scrollToBottom(divRef);
    })

    useEffect(() => {
        if (!loading && data && !isFetched) {
            setMessages(data.adminGetMessages);
            isFetched = true;
        }
    }, [loading, data]);

    useEffect(() => {
        if (socket) {
            socket.on("receiveMessage", ({ message, conversationInfo }) => {
                if (conversationInfo._id === conversationId) {
                    setMessages((prev) => [
                        ...prev,
                        { from: conversationInfo.user._id, text: message },
                    ]);
                    divRef.current && scrollToBottom(divRef)
                }
            });
        }
    }, [socket]);

    useEffect(() => {
        isFetched = false;
        conversationId = conversation._id
        refetch();
        divRef.current && scrollToBottom(divRef)
    }, [conversation]);

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    const sendMessageHandler = async (e) => {
        e.preventDefault();
        if (message.trim() === "") {
            return;
        }
        if (socket) {
            socket.emit("sendMessage", { message, _id, toUser: conversation.user._id });
            socket.on("sentMessage", () => {
                setMessages([...messages, { from: _id, text: message }]);
                setMessage("");
                refetchConversations();
                divRef.current && scrollToBottom(divRef)
            });
            socket.on("error", (error) => {
                console.log(error);
            });
        }
    };
    return (
        <div className="container">
            <div
                style={{ width: "36rem", height: "45rem" }}
                className="mx-auto border border-2 rounded-2"
            >
                <div className="d-flex align-items-center py-2 px-3 border border-1">
                    <div>
                        <img
                            src={conversation.user.profileImage.url}
                            alt="Admin profile image"
                            style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                        />
                    </div>
                    <div className="ms-2">
                        <p className="fs-4 fw-bold text-secondary">{conversation.user.username}</p>
                    </div>
                </div>
                <div style={{ height: "38rem", overflowY: "scroll" }}>
                    <Messages _id={_id} messages={messages} divRef={divRef} scrollToBottom={scrollToBottom} />
                </div>
                <div className="w-100">
                    <form className="d-flex align-items-center" onSubmit={sendMessageHandler}>
                        <input
                            type="text"
                            className="form-control py-2"
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
                        />
                        <button className="btn btn-primary py-2 px-2">
                            <Icon name="send" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWith;
