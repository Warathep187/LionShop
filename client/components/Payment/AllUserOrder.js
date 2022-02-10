import { useState } from "react";
import moment from "moment";
import { Icon, Modal, Rating, Form } from "semantic-ui-react";
import { useMutation } from "@apollo/client";
import { GET_SPECIFIC_PAYMENT, GET_PAYMENTS } from "../../queries/payment";
import { COMMENT } from "../../queries/comment";
import { toast } from "react-toastify";
import Link from "next/link";
import LoadingPage from "../LoadingPage";

const AllUserOrder = ({ orders }) => {
    const [payments, setPayments] = useState(orders);
    const [displayData, setDisplayData] = useState({});
    const [displayProduct, setDisplayProduct] = useState({});
    const [getSpecificPayment] = useMutation(GET_SPECIFIC_PAYMENT, {
        update: (res, { data }) => {
            setDisplayData(data.getSpecificPayment);
        },
        onError: (err) => toast.error(err.message),
    });
    const [comment] = useMutation(COMMENT, {
        update: (res, { data }) => {
            toast(data.comment);
            setDisplayData({});
            setDisplayProduct({});
        },
        onError: (err) => toast.error(err.message),
    });

    const [open, setOpen] = useState(false);
    const [enteredData, setEnteredData] = useState({
        text: "",
        rating: 1,
    });
    const [isLoading, setIsLoading] = useState(false);

    const {
        _id,
        status,
        products,
        slipImage,
        fullName,
        address,
        tel,
        trackingNumber,
        createdAt,
        reviewExpirationTime,
    } = displayData;

    const confirmOrCancel = ({ confirm, cancel }) => {
        if (confirm) {
            return <p className="fw-bold text-success">Confirmed</p>;
        } else if (cancel) {
            return <p className="fw-bold text-danger">Canceled</p>;
        } else {
            return <p className="fw-bold text-warning">Waiting..</p>;
        }
    };

    const getPaymentHandler = async (paymentId) => {
        await getSpecificPayment({
            variables: {
                input: {
                    paymentId,
                },
            },
        });
    };

    const showReviewModal = (productId) => {
        const specificProduct = products.find((item) => item.product._id === productId);
        setDisplayProduct(specificProduct.product);
        setOpen(true);
    };

    const ratingChangeHandler = (e, { rating }) => {
        setEnteredData({ ...enteredData, rating: rating });
    };

    const reviewHandler = async (e) => {
        setIsLoading(true);
        if (enteredData.text.trim().length > 512) {
            toast.error("Comment must be less than 512 characters");
        } else if (
            isNaN(parseInt(enteredData.rating)) ||
            parseInt(enteredData.rating) > 5 ||
            parseInt(enteredData.rating) < 1
        ) {
            toast.error("Invalid rating");
        } else {
            await comment({
                variables: {
                    input: {
                        ...enteredData,
                        orderId: _id,
                        productId: displayProduct._id,
                    },
                    refetchQueries: [{ query: GET_PAYMENTS }],
                },
            });
            setEnteredData({
                text: "",
                rating: 1,
            });
            setOpen(false);
        }
        setIsLoading(false);
    };

    return (
        <>
            <div className="row position-relative">
                <Modal
                    onClose={() => {
                        setEnteredData({
                            text: "",
                            rating: 1,
                        });
                        setOpen(false);
                    }}
                    open={open}
                    style={{
                        position: "absolute",
                        left: "33%",
                        top: "20%",
                        transition: "translate(-50%, -50%)",
                        width: "40rem",
                        height: "22rem",
                    }}
                >
                    <Modal.Header>Review this product</Modal.Header>
                    <Modal.Content image>
                        {displayProduct && displayProduct._id ? (
                            <div className="text-center mx-auto">
                                <Form loading={isLoading} onSubmit={reviewHandler}>
                                    <Rating
                                        maxRating={5}
                                        defaultRating={enteredData.rating}
                                        icon="star"
                                        size="massive"
                                        className="mx-auto mb-3"
                                        onRate={ratingChangeHandler}
                                    />
                                    <div className="form-floating">
                                        <textarea
                                            className="form-control"
                                            id="floatingTextarea"
                                            style={{ height: "8rem", width: "30rem" }}
                                            maxLength="512"
                                            onChange={(e) =>
                                                setEnteredData((prev) => ({
                                                    ...prev,
                                                    text: e.target.value,
                                                }))
                                            }
                                            value={enteredData.text}
                                        />
                                        <label htmlFor="floatingTextarea">Comments</label>
                                    </div>
                                    <div className="text-end mt-2">
                                        <button
                                            className="btn btn-outline-primary px-4"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Reviewing" : "Review"}
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        ) : (
                            <LoadingPage />
                        )}
                    </Modal.Content>
                </Modal>
                <div className="col-9">
                    <table className="table table-light table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Order No.</th>
                                <th scope="col">Ordered At</th>
                                <th scope="col">Status</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td>{payment._id}</td>
                                    <td>{moment(payment.createdAt).fromNow()}</td>
                                    <td>{confirmOrCancel(payment.status)}</td>
                                    <td>
                                        <Icon
                                            name="eye"
                                            size="large"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => getPaymentHandler(payment._id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="col-3 mb-5">
                    <div className="border border-2 p-2 rounded-2">
                        {displayData && displayData._id ? (
                            <div>
                                <p>
                                    Order No. <span className="fw-bold">{_id}</span>
                                </p>
                                <div className="border rounded-2 p-2 text-break mb-2">
                                    <p className="mb-0 fw-bold">{fullName}</p>
                                    <p className="my-0">{address}</p>
                                    <p>{tel}</p>
                                </div>
                                {!status.cancel && status.confirm && (
                                    <>
                                        <span>หมายเลขพัสดุ : </span>
                                        {trackingNumber ? (
                                            <span className="text-success">{trackingNumber}</span>
                                        ) : (
                                            <span className="text-warning">
                                                กำลังรอผู้ขายกรอกหมายเลขพัสดุ
                                            </span>
                                        )}
                                    </>
                                )}
                                <p className="fs-5 my-2">{confirmOrCancel(status)}</p>
                                <div>
                                    <img
                                        src={slipImage.url}
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
                                    {products.map((product) => (
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
                                                    <Link href={`/product/${product.product._id}`}>
                                                        <p
                                                            className="fs-5 fw-bold text-primary"
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            {product.product.name}
                                                        </p>
                                                    </Link>
                                                    {reviewExpirationTime &&
                                                        !product.isReviewed &&
                                                        reviewExpirationTime >
                                                            moment(Date.now()).toISOString() &&
                                                        status.confirm && (
                                                            <Icon
                                                                name="commenting"
                                                                size="large"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() =>
                                                                    showReviewModal(
                                                                        product.product._id
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                </div>
                                                <span className="badge bg-secondary">
                                                    {product.type_}
                                                </span>
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
            </div>
        </>
    );
};

export default AllUserOrder;
