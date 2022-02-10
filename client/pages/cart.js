import { useState } from "react";
import { useDispatch } from "react-redux";
import { cartAction } from "../store/index";
import { useQuery, useMutation } from "@apollo/client";
import {
    GET_ALL_ITEMS_IN_CART,
    REMOVE_ITEM,
    ITEM_INCREMENT,
    ITEM_DECREMENT,
    CHECKOUT,
} from "../queries/cart";
import LoadingPage from "../components/LoadingPage";
import OrderList from "../components/Cart/OrderList";
import { Icon } from "semantic-ui-react";
import { toast } from "react-toastify";
import Link from "next/link";
import swal from "sweetalert";

const cart = () => {
    const dispatch = useDispatch();
    const { loading, data, error } = useQuery(GET_ALL_ITEMS_IN_CART);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [order, setOrder] = useState({
        items: [],
        qrcode: null,
    });

    const [itemIncrement] = useMutation(ITEM_INCREMENT, {
        update: (res, { data }) => {
            const index = selectedItems.findIndex((item) => item._id === data.itemIncrement._id);
            if (index !== -1) {
                let temp = JSON.parse(JSON.stringify(selectedItems[index]));
                temp.amount = temp.amount + 1;
                let tempSelected = JSON.parse(JSON.stringify(selectedItems));
                tempSelected[index] = temp;
                setSelectedItems(tempSelected);
            }
        },
        onError: (err) => toast.error(err.message),
    });
    const [itemDecrement] = useMutation(ITEM_DECREMENT, {
        update: (res, { data }) => {
            const index = selectedItems.findIndex((item) => item._id === data.itemDecrement._id);
            if (index !== -1) {
                let temp = JSON.parse(JSON.stringify(selectedItems[index]));
                temp.amount = temp.amount - 1;
                let tempSelected = JSON.parse(JSON.stringify(selectedItems));
                tempSelected[index] = temp;
                setSelectedItems(tempSelected);
            }
        },
        onError: (err) => toast.error(err.message),
    });
    const [removeItemInCart] = useMutation(REMOVE_ITEM, {
        update: (res, { data }) => {
            const index = selectedItems.findIndex((item) => item._id === data.removeItem);
            if (index !== -1) {
                const filtered = selectedItems.filter((item) => item._id !== data.removeItem);
                setSelectedItems(filtered);
            }
            dispatch(cartAction.remove(data.removeItem));
            toast("Removed");
        },
        onError: (err) => toast(err.message),
    });

    const [checkout] = useMutation(CHECKOUT, {
        update: (res, { data }) => {
            setOrder(data.checkout);
        },
        onError: (err) => toast(err.message),
    });

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    const increaseItemHandler = async (id) => {
        setIsLoading(true);
        await itemIncrement({
            variables: {
                input: id,
            },
            refetchQueries: [
                {
                    query: GET_ALL_ITEMS_IN_CART,
                },
            ],
        });
        setIsLoading(false);
    };

    const decreaseItemHandler = async (id) => {
        setIsLoading(true);
        const curAmount = data.cart.find((item) => item._id === id).amount;
        if (curAmount === 1) {
            swal({
                title: "Are you sure you want to delete this product?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then(async (willDelete) => {
                if (willDelete) {
                    await removeItemInCart({
                        variables: {
                            input: id,
                        },
                        refetchQueries: [
                            {
                                query: GET_ALL_ITEMS_IN_CART,
                            },
                        ],
                    });
                }
            });
        } else {
            await itemDecrement({
                variables: {
                    input: id,
                },
                refetchQueries: [
                    {
                        query: GET_ALL_ITEMS_IN_CART,
                    },
                ],
            });
        }
        setIsLoading(false);
    };

    const removeItem = (id) => {
        swal({
            title: "Are you sure you want to remove this item?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                removeItemInCart({
                    variables: {
                        input: id,
                    },
                    refetchQueries: [
                        {
                            query: GET_ALL_ITEMS_IN_CART,
                        },
                    ],
                });
            }
        });
    };

    const toggleHandler = (id) => {
        const index = selectedItems.findIndex((item) => item._id === id);
        if (index === -1) {
            const curItem = data.cart.find((item) => item._id === id);
            setSelectedItems([...selectedItems, curItem]);
        } else {
            const filtered = selectedItems.filter((item) => item._id !== id);
            setSelectedItems(filtered);
        }
    };

    const summary = () => {
        let sum = 0;
        for (const item of selectedItems) {
            sum += item.price * item.amount;
        }
        return sum.toLocaleString();
    };

    const checkoutHandler = async () => {
        setIsCheckingOut(true);
        if (selectedItems.length === 0) {
            toast.error("Please select item");
        } else {
            await checkout({
                variables: {
                    input: selectedItems.map((item) => item._id),
                },
            });
        }
        setIsCheckingOut(false);
    };

    return (
        <>
            <div className="container">
                <div className="d-flex justify-content-between align-items-baseline">
                    <div>
                        <p className="display-4 mb-2">Cart ({data.cart.length} รายการ)</p>
                        <span className="fs-4 text-secondary">
                            ยอดรวม{" "}
                            <span className="text-dark">
                                {selectedItems.length === 0 ? 0 : summary()}
                            </span>{" "}
                            บาท
                        </span>
                    </div>
                    <div>
                        <button
                            className="btn btn-outline-success py-2 px-5"
                            disabled={selectedItems.length === 0 || isCheckingOut}
                            onClick={checkoutHandler}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="col-6">
                        {data.cart.map((item) => (
                            <div className="rounded-2 p-3 d-flex border border-2" key={item._id}>
                                <div>
                                    <img
                                        src={item.product.coverImage.url}
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            objectFit: "cover",
                                        }}
                                        alt="Product Image"
                                    />
                                </div>
                                <div className="d-flex flex-column align-content-between p-3 w-100 position-relative">
                                    <div className="d-flex justify-content-between">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                style={{ marginTop: "10px" }}
                                                type="checkbox"
                                                defaultChecked={selectedItems.find(
                                                    (val) => val._id === item._id
                                                )}
                                                onChange={() => toggleHandler(item._id)}
                                            />
                                            <Link href={`/product/${item.product._id}`}>
                                                <p
                                                    className="fs-3 mb-1"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {item.product.name.length > 15
                                                        ? item.product.name.slice(0, 13) + ".."
                                                        : item.product.name}
                                                </p>
                                            </Link>
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-outline-success me-1"
                                                onClick={() => increaseItemHandler(item._id)}
                                                disabled={isLoading}
                                            >
                                                +
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() => decreaseItemHandler(item._id)}
                                                disabled={isLoading}
                                            >
                                                -
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        {item.product.multipleType && (
                                            <div>
                                                <span
                                                    className="badge bg-secondary mb-1"
                                                    style={{ fontSize: "15px" }}
                                                >
                                                    {item.type_}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <span
                                                className="badge bg-success"
                                                style={{ fontSize: "15px" }}
                                            >
                                                {item.price.toLocaleString()}
                                            </span>{" "}
                                            x{" "}
                                            <span style={{ fontSize: "15px" }}>
                                                {item.amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "18px" }} className="mt-1">
                                                Result{" "}
                                                <span className="fw-bold">
                                                    {(item.price * item.amount).toLocaleString()}
                                                </span>{" "}
                                                THB
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle p-2 border border-light rounded-circle"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => removeItem(item._id)}
                                    >
                                        <Icon name="delete" size="large" color="red" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="col-6">
                        <OrderList order={order} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default cart;
