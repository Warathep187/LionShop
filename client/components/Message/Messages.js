import {useEffect} from "react";

const Messages = ({ messages, _id, divRef, scrollToBottom }) => {
    useEffect(() => {
        divRef.current && scrollToBottom(divRef);
    })

    const checkMessage = (message, index) => {
        if (message.to === _id || message.from !== _id) {
            return (
                <div className="my-1" key={index} ref={divRef}>
                    <div
                        className="rounded-2 ms-1 p-2 bg-dark text-light text-break text-start"
                        style={{ maxWidth: "15rem", width: "fit-content" }}
                    >
                        <p>{message.text}</p>
                    </div>
                </div>
            );
        } else if (message.from === _id || message.to !== _id) {
            return (
                <div className="text-end my-1" key={index} ref={divRef}>
                    <div
                        className="rounded-2 ms-auto me-1 p-2 bg-primary text-break text-start"
                        style={{ maxWidth: "15rem", width: "fit-content" }}
                    >
                        <p>{message.text}</p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="mx-1">{messages.map((message, index) => checkMessage(message, index, divRef))}</div>
    );
};

export default Messages;
