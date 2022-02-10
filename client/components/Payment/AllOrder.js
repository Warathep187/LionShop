import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { Icon } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useLazyQuery, useMutation } from "@apollo/client";
import { ADMIN_GET_SPECIFIC_PAYMENT, ADD_TRACKING_NUMBER } from "../../queries/admin";
import Link from "next/link";
import { io } from "socket.io-client";
const socket = io("http://localhost:8000");

const AllOrder = ({ orders }) => {
    const [payments, setPayments] = useState(orders);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const { _id } = useSelector((state) => state.profileSlice);
    const [addTrackingNumber] = useMutation(ADD_TRACKING_NUMBER, {
        update: (res, { data }) => {
            setIsAdded(true);
            toast("Added!");
        },
        onError: (err) => toast.error(err.message),
    });
    const [getSpecificPayment, { loading, data, error }] = useLazyQuery(ADMIN_GET_SPECIFIC_PAYMENT);

    useEffect(() => {
        if (socket) {
            socket.on("error", (message) => toast.error(message));
        }
    }, [socket]);

    const confirmHandler = async (orderId, userId) => {
        socket.emit("actionsInOrder", { orderId, userId, type: "confirm", _id });
        socket.on("confirmedOrder", () => {
            toast("Confirmed");
            const mapping = payments.map((payment) => {
                if (payment._id === orderId) {
                    let temp = JSON.parse(JSON.stringify(payment));
                    temp.status.confirm = true;
                    return temp;
                }
                return payment;
            });
            setPayments(mapping);
        });
    };

    const cancelHandler = async (orderId, userId) => {
        socket.emit("actionsInOrder", { orderId, userId, type: "cancel", _id });
        socket.on("canceledOrder", () => {
            toast("Canceled");
            const mapping = payments.map((payment) => {
                if (payment._id === orderId) {
                    let temp = JSON.parse(JSON.stringify(payment));
                    temp.status.cancel = true;
                    return temp;
                }
                return payment;
            });
            setPayments(mapping);
        });
    };

    const confirmOrCancel = ({ confirm, cancel }) => {
        if (confirm) {
            return <p className="fw-bold text-success">Confirmed</p>;
        } else if (cancel) {
            return <p className="fw-bold text-danger">Canceled</p>;
        } else {
            return <p className="fw-bold text-warning">Waiting..</p>;
        }
    };

    const viewSpecificPayment = (paymentId) => {
        getSpecificPayment({
            variables: {
                paymentId,
            },
        });
        setIsAdded(false);
    };

    const addTrackingNumberHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (trackingNumber.trim() === "") {
            toast.error("Tracking number must be provided");
        } else {
            await addTrackingNumber({
                variables: {
                    input: {
                        trackingNumber,
                        paymentId: data.adminGetSpecificPayment._id,
                    },
                },
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="row">
            <div className="col-8">
                <table className="table table-light table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Order No.</th>
                            <th scope="col">Buyer</th>
                            <th scope="col">Ordered At</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment._id}>
                                <td>{payment._id}</td>
                                <td>
                                    <Link href={`/admin/user/${payment.user}`}>{payment.user}</Link>
                                </td>
                                <td>{moment(payment.createdAt).fromNow()}</td>
                                <td>{confirmOrCancel(payment.status)}</td>
                                <td>
                                    {!payment.status.confirm && !payment.status.cancel && (
                                        <>
                                            <Icon
                                                name="check"
                                                color="green"
                                                size="large"
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    confirmHandler(payment._id, payment.user)
                                                }
                                            />
                                            <Icon
                                                name="cancel"
                                                color="red"
                                                size="large"
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    cancelHandler(payment._id, payment.user)
                                                }
                                            />
                                        </>
                                    )}
                                    <Icon
                                        name="eye"
                                        size="large"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => viewSpecificPayment(payment._id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="col-4 px-2">
                {loading && <p>Loading...</p>}
                {error && <p>{error.message}</p>}
                {data && data.adminGetSpecificPayment ? (
                    <div className="pe-3">
                        <p className="mb-1">
                            Order No.{" "}
                            <span className="fw-bold">{data.adminGetSpecificPayment._id}</span>
                        </p>
                        <p className="mb-1">
                            Buyer{" "}
                            <span className="fw-bold">
                                {
                                    <Link href={`/admin/user/${data.adminGetSpecificPayment.user}`}>
                                        {data.adminGetSpecificPayment.user}
                                    </Link>
                                }
                            </span>
                        </p>
                        <div className="border rounded-2 p-2 text-break mb-2">
                            <p className="mb-0 fw-bold">{data.adminGetSpecificPayment.fullName}</p>
                            <p className="my-0">{data.adminGetSpecificPayment.address}</p>
                            <p>{data.adminGetSpecificPayment.tel}</p>
                        </div>
                        {!data.adminGetSpecificPayment.status.cancel &&
                            data.adminGetSpecificPayment.status.confirm && (
                                <>
                                    <span>หมายเลขพัสดุ : </span>
                                    {data.adminGetSpecificPayment.trackingNumber ? (
                                        <input
                                            type="text"
                                            placeholder="Tracking number"
                                            className="form-control"
                                            value={data.adminGetSpecificPayment.trackingNumber}
                                            readOnly
                                        />
                                    ) : (
                                        <form
                                            className="d-flex"
                                            onSubmit={addTrackingNumberHandler}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Tracking number"
                                                className="form-control"
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                value={trackingNumber}
                                                readOnly={isAdded}
                                            />
                                            {!isAdded && (
                                                <button
                                                    className="btn btn-primary ms-1"
                                                    disabled={!trackingNumber || isLoading}
                                                >
                                                    {isLoading ? "Adding.." : "Add"}
                                                </button>
                                            )}
                                        </form>
                                    )}
                                </>
                            )}
                        <p className="fs-5 my-2">
                            {confirmOrCancel(data.adminGetSpecificPayment.status)}
                        </p>
                        <div>
                            <img
                                src={data.adminGetSpecificPayment.slipImage.url}
                                alt="Slip"
                                style={{
                                    width: "100%",
                                    height: "350px",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                        <hr />
                        <div className="mt-2">
                            <h3>Products</h3>
                            {data.adminGetSpecificPayment.products.map((product) => (
                                <div key={product.product._id} className="d-flex my-3">
                                    <div>
                                        <img
                                            src={product.product.coverImage.url}
                                            alt="image"
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                    <div className="mx-2 w-100">
                                        <div className="d-flex align-items-center justify-content-between w-100">
                                            <Link href={`/admin/products/${product.product._id}`}>
                                                <p
                                                    className="fs-5 fw-bold text-primary"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {product.product.name}
                                                </p>
                                            </Link>
                                        </div>
                                        <span className="badge bg-secondary">{product.type_}</span>
                                        <div>
                                            <span className="badge bg-success">
                                                {product.price.toLocaleString()} THB
                                            </span>
                                            <span> X {product.amount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="fs-4">ยังไม่ได้เลือก</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllOrder;
