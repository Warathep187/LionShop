import { Icon } from "semantic-ui-react";
import Link from "next/link";
import moment from "moment";

const Cancel = ({ notification }) => {
    return (
        <div className="my-1 border border-3 border-danger rounded-2 py-3 px-4 w-75 mx-auto position-relative">
            <div style={{ position: "absolute", top: "0", right: "0", cursor: "pointer" }}>
                <Link href="/payment">
                    <Icon name="eye" size="large" />
                </Link>
            </div>
            <div className="d-flex align-items-center">
                <img
                    src="https://i.pinimg.com/originals/34/60/3c/34603ce8a80b1ce9a768cad7ebf63c56.jpg"
                    alt="Admin Profile"
                    style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
                <p className="fw-bold fs-4 ms-2">LionShop Admin</p>
            </div>
            <div className="mt-3 d-flex align-items-center justify-content-between">
                <p className="fs-5">
                    ออเดอร์(<i>{notification.orderId}</i>) ได้ถูกยกเลิกแล้ว
                </p>
                <p className="text-secondary">ยกเลิกเมื่อ {moment(notification.createdAt).fromNow()}</p>
            </div>
        </div>
    );
};

export default Cancel;
