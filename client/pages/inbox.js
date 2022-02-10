import { useEffect, useState, useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../queries/message";
import LoadingPage from "../components/LoadingPage";
import Messages from "../components/Message/Messages";
import { Icon } from "semantic-ui-react";
import { useSelector } from "react-redux";

import socket from "../utils/socketIOClient"

const scrollToBottom = (divRef) => {
    divRef.current !== null && divRef.current.scrollIntoView({ behavior: "smooth" });
};

const inbox = () => {
    const { _id } = useSelector((state) => state.profileSlice);
    const [message, setMessage] = useState("");
    const { loading, data, error } = useQuery(GET_MESSAGES);

    const [messages, setMessages] = useState([]);

    const divRef = useRef();

    useEffect(() => {
        if (!loading && data) {
            setMessages(data.getMessages);
        } 
    }, [loading, data]);

    useEffect(() => {
        if(socket) {
            socket.on("receiveMessage", ({message, from}) => {
                setMessages(prev => ([...prev, {from, text: message}]))
                divRef.current && scrollToBottom(divRef);
            })
        }
    }, [socket])

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    const sendMessageHandler = async (e) => {
        e.preventDefault();
        if(message.trim() === "") {
            return;
        }
        if(socket) {
            console.log(message);
            socket.emit("sendMessage", {type: "text", message, _id});
            socket.on("sentMessage", () => {
                setMessages([...messages, {from: _id, text: message}]);
                setMessage("");
                divRef.current && scrollToBottom(divRef);
            })
            socket.on("error", (error) => {console.log(error)})
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
                            src="/static/image/LionProfileImage.jpg"
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
                        <p className="fs-4 fw-bold text-secondary">Admin</p>
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

export default inbox;
