import { useEffect, useState, useRef } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import {
    ADMIN_GET_CONVERSATIONS,
    ADMIN_NEW_CHAT_USERS,
    ADMIN_CREATE_NEW_CHAT,
} from "../../queries/admin";
import LoadingPage from "../../components/LoadingPage";
import Messages from "../../components/Message/Messages";
import { Icon } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import ChatWith from "../../components/Chat/ChatWith";
import moment from "moment";
import { toast } from "react-toastify";

import socket from "../../utils/socketIOClient";

const scrollToBottom = (divRef) => {
    divRef.current !== null && divRef.current.scrollIntoView({ behavior: "smooth" });
};

const inbox = () => {
    const router = useRouter();
    const [curConversation, setCurConversation] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
    const { loading, data, error, refetch } = useQuery(ADMIN_GET_CONVERSATIONS);
    const [adminNewChatUsers, { loading: lazyLoading, data: lazyData, error: lazyError }] =
        useLazyQuery(ADMIN_NEW_CHAT_USERS);

    const [adminCreateNewChat] = useMutation(ADMIN_CREATE_NEW_CHAT, {
        update: (res, { data }) => {
            toast("Created");
            refetch();
            setCurConversation(data.adminCreateNewChat);
            setSelectedUser(null);
        },
        onError: (err) => toast.error(err.message),
    });

    const divRef = useRef();

    useEffect(() => {
        if (!loading && data) {
            setConversations(data.adminGetConversations);
        }
    }, [loading, data]);

    useEffect(() => {
        if (socket) {
            socket.on("receiveMessage", ({ conversationInfo }) => {
                refetch();
            });
        }
    }, [socket]);

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    const fetchNewChatUsers = async () => {
        await adminNewChatUsers();
    };

    const createNewChat = async () => {
        setIsLoading(true);
        if (!selectedUser) {
            toast.error("User is required");
        } else {
            await adminCreateNewChat({
                variables: {
                    input: {
                        userId: selectedUser,
                    },
                },
            });
            adminNewChatUsers();
        }
        setIsLoading(false);
    };

    return (
        <>
            <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                Modal title
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={() => setSelectedUser(null)}
                            />
                        </div>
                        <div className="modal-body">
                            <div>
                                {lazyData &&
                                    lazyData.adminNewChatUsers.map((user) => (
                                        <div
                                            className={`d-flex align-items-center px-3 py-2 border ${
                                                user._id === selectedUser ? "bg-primary" : ""
                                            }`}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setSelectedUser(user._id)}
                                        >
                                            <img
                                                src={user.profileImage.url}
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div className="ms-2">
                                                <p className="fs-4 mb-1">{user.username}</p>
                                                <p className="fs-5">({user._id})</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!selectedUser || isLoading}
                                onClick={createNewChat}
                            >
                                Create New Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-5">
                <div className="row">
                    <div className="col-3">
                        <div className="my-2">
                            <button
                                className="btn btn-outline-primary text-center"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                                onClick={fetchNewChatUsers}
                            >
                                <Icon name="add" size="big" />
                                New Chat
                            </button>
                        </div>
                        {conversations.map((conversation) => (
                            <div
                                className={`border d-flex align-items-center p-2 w-100 ${
                                    conversation.isRead ? "" : "position-relative"
                                } ${
                                    curConversation && curConversation._id === conversation._id
                                        ? "bg-primary"
                                        : ""
                                }`}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    const afterRead = conversations.map((con) => {
                                        if (con._id === conversation._id) {
                                            return {
                                                ...con,
                                                isRead: true,
                                            };
                                        }
                                        return con;
                                    });
                                    setConversations(afterRead);
                                    setCurConversation(conversation);
                                }}
                                key={conversation._id}
                            >
                                <img
                                    src={conversation.user.profileImage.url}
                                    alt="Profile Image"
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                    }}
                                />
                                <div className="ms-2">
                                    <p className="fs-4 mb-2">
                                        {conversation.user.username.length > 22
                                            ? conversation.user.username.slice(0, 20) + ".."
                                            : conversation.user.username}
                                    </p>
                                    <div className="w-100">
                                        <p className="fw-bold ms-auto">
                                            {moment(conversation.lastMessageAt).fromNow()}
                                        </p>
                                    </div>
                                </div>
                                {!conversation.isRead && (
                                    <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"></span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="col-9">
                        {curConversation && curConversation._id && (
                            <ChatWith
                                conversation={curConversation}
                                conversations={conversations}
                                refetchConversations={refetch}
                                divRef={divRef}
                                scrollToBottom={scrollToBottom}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default inbox;
