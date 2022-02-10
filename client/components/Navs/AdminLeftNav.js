import { Icon } from "semantic-ui-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { profileActions } from "../../store/index";
import { READ_MESSAGE } from "../../queries/message";
import { useMutation } from "@apollo/client";

//const alert = new Audio("/static/sound/alert.mp3");

const AdminLeftNav = ({ children, _id, unreadMessage }) => {
    const dispatch = useDispatch();
    const [readMessage] = useMutation(READ_MESSAGE, {
        update: (res, { data }) => {
            dispatch(profileActions.readMessage());
        },
    });

    return (
        <div className="row">
            <div className="col-2 text-center">
                <div className="py-3 border">
                    <Link href="/admin/dashboard">
                        <a className="fs-5">
                            <Icon name="dashboard" />
                            Dashboard
                        </a>
                    </Link>
                </div>
                <div className="py-3 border">
                    <Link href="/admin/categories">
                        <a className="fs-5">
                            <Icon name="list alternate" />
                            Categories
                        </a>
                    </Link>
                </div>
                <div className="py-3 border">
                    <Link href="/admin/products">
                        <a className="fs-5">
                            <Icon name="briefcase" />
                            Products
                        </a>
                    </Link>
                </div>
                <div className="py-3 border position-relative">
                    <a className="fs-5" href="/admin/inbox" onClick={readMessage}>
                        <Icon name="inbox" />
                        Inbox
                    </a>
                    {unreadMessage && (
                        <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"></span>
                    )}
                </div>
                <div className="py-3 border">
                    <Link href="/admin/order">
                        <a className="fs-5">
                            <Icon name="payment" />
                            Order
                        </a>
                    </Link>
                </div>
            </div>
            <div className="col-10">
                <div className="mt-3">{children}</div>
            </div>
        </div>
    );
};

export default AdminLeftNav;
