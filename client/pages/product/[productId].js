import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { SINGLE_PRODUCT } from "../../queries/product";
import { ADD_TO_CART } from "../../queries/cart";
import { Rating } from "semantic-ui-react";
import client from "../../apollo-client";
import { Icon, Button } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { cartAction } from "../../store/index";
import Comments from "../../components/Comment/Comments";
import calPrice from "../../utils/calulatePrice";

const SingleProduct = ({ product, error }) => {
    if (error) {
        return <p>{error}</p>;
    }
    const dispatch = useDispatch();
    const router = useRouter();
    const { username } = useSelector((state) => state.profileSlice);
    const [displayData, setDisplayData] = useState({});
    const [selectedItem, setSelectedItem] = useState({
        product: product.multipleType ? "" : product._id,
        type: "",
        price: product.multipleType ? null : product.type.price,
        amount: product.multipleType ? null : product.type.amount === 0 ? 0 : 1,
    });
    const [addToCart] = useMutation(ADD_TO_CART, {
        update: (res, { data }) => {
            toast("added");
            dispatch(cartAction.addToCart(data.addToCart));
        },
        onError: (err) => toast.error(err.message),
    });
    const { price, amount } = selectedItem;
    const [isLoading, setIsLoading] = useState(false);

    const selectItem = (item) => {
        setDisplayData(product.types.find((val) => val.type_ === item));
        setSelectedItem({
            product: product._id,
            type: item,
            price: product.types.find((val) => val.type_ === item).price,
            amount: product.types.find((val) => val.type_ === item).amount > 0 ? 1 : 0,
        });
    };

    const addToCartHandler = async (e) => {
        e.preventDefault();
        if (!username) {
            return router.push("/login");
        }
        setIsLoading(true);
        if (!selectedItem.product.match(/^[0-9a-fA-F]{24}$/)) {
            toast.error("Please select type");
        } else if (isNaN(parseInt(price))) {
            toast.error("Invalid price");
        } else if (parseInt(price) < 1) {
            toast.error("Price must not be less than 1 THB");
        } else if (isNaN(parseInt(amount))) {
            toast.error("Invalid amount");
        } else if (parseInt(amount) < 1) {
            toast.error("Amount must not be less than 1 piece");
        } else {
            addToCart({
                variables: {
                    input: {
                        ...selectedItem,
                        price: parseInt(price),
                        amount: parseInt(amount),
                    },
                },
            });
        }
        setIsLoading(false);
    };

    return (
        <>
            <div className="container">
                <div className="row mt-3">
                    <div className="col-7">
                        {product.images.length > 0 ? (
                            <div
                                id="carouselExampleIndicators"
                                className="carousel slide"
                                data-bs-ride="carousel"
                            >
                                <div className="carousel-indicators">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            data-bs-target="#carouselExampleIndicators"
                                            data-bs-slide-to={index}
                                            className={`${index === 0 ? "active" : ""}`}
                                            aria-current="true"
                                        />
                                    ))}
                                </div>
                                <div className="carousel-inner">
                                    {product.images.map((image, index) => (
                                        <div
                                            className={`carousel-item ${
                                                index === 0 ? "active" : ""
                                            }`}
                                            key={index}
                                        >
                                            <img
                                                src={image.url}
                                                className="d-block w-100"
                                                alt="image"
                                                style={{
                                                    height: "400px",
                                                    width: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="carousel-control-prev"
                                    type="button"
                                    data-bs-target="#carouselExampleIndicators"
                                    data-bs-slide="prev"
                                >
                                    <span
                                        className="carousel-control-prev-icon"
                                        aria-hidden="true"
                                    />
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button
                                    className="carousel-control-next"
                                    type="button"
                                    data-bs-target="#carouselExampleIndicators"
                                    data-bs-slide="next"
                                >
                                    <span
                                        className="carousel-control-next-icon"
                                        aria-hidden="true"
                                    />
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </div>
                        ) : (
                            <img
                                src={product.coverImage.url}
                                className="d-block w-100"
                                alt="image"
                                style={{
                                    height: "400px",
                                    width: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        )}
                    </div>
                    <div className="col-5">
                        <div className="text-break">
                            <p className="fs-1 fw-bold mb-1">{product.name}</p>
                            <hr />
                            <div className="d-flex align-items-center fs-5">
                                <div className="d-flex align-items-center me-2">
                                    <Rating
                                        icon="star"
                                        defaultRating={
                                            product.rating.ratings === 0
                                                ? 0
                                                : product.rating.sumPoint / product.rating.ratings
                                        }
                                        maxRating={5}
                                        size="large"
                                        disabled
                                    />
                                    <span>
                                        (
                                        {product.rating.ratings === 0
                                            ? 0
                                            : product.rating.sumPoint / product.rating.ratings}
                                        )
                                    </span>
                                </div>
                                |<span className="mx-3">{product.rating.ratings} Ratings</span>|
                                <span className="ms-3">{product.sold} Sold</span>
                            </div>
                        </div>
                        <div>
                            <div className="fs-3 my-5">
                                <span>Price </span>
                                {product.multipleType ? (
                                    <span className="fw-bolder text-success">
                                        {selectedItem.product
                                            ? selectedItem.price
                                            : calPrice(product.types)}
                                    </span>
                                ) : (
                                    <span className="fw-bolder text-success">
                                        {product.type.price.toLocaleString()}
                                    </span>
                                )}{" "}
                                THB
                            </div>
                            <div>
                                <div className="d-flex">
                                    {product.multipleType &&
                                        product.types.map((type) => (
                                            <div key={type.type_} className="mx-1">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="selectType"
                                                    id={`success-outlined${type.type_}`}
                                                    onClick={() => selectItem(type.type_)}
                                                />
                                                <label
                                                    className="btn btn-outline-success px-4"
                                                    htmlFor={`success-outlined${type.type_}`}
                                                >
                                                    {type.type_}
                                                </label>
                                            </div>
                                        ))}
                                </div>
                                {selectedItem && selectedItem.product && (
                                    <div className="w-25 my-2">
                                        <input
                                            type="number"
                                            className="form-control"
                                            min={0}
                                            disabled={displayData.amount === 0}
                                            max={
                                                product.multipleType
                                                    ? displayData.amount
                                                    : product.type.amount
                                            }
                                            value={amount}
                                            onChange={(e) =>
                                                setSelectedItem({
                                                    ...selectedItem,
                                                    amount: e.target.value,
                                                })
                                            }
                                        />
                                        <span className="text-secondary">
                                            {product.multipleType
                                                ? displayData.amount
                                                : product.type.amount}{" "}
                                            piece available
                                        </span>
                                    </div>
                                )}
                                <div className="mt-4">
                                    <Button
                                        animated="vertical"
                                        className="py-3 px-3"
                                        style={{ width: "7rem" }}
                                        onClick={addToCartHandler}
                                        disabled={isLoading}
                                    >
                                        <Button.Content hidden>Add to cart</Button.Content>
                                        <Button.Content visible>
                                            <Icon name="shop" size="large" />
                                        </Button.Content>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div style={{ padding: "0 10rem" }}>
                    <span className="fs-3 fw-bold" style={{ textDecoration: "underline" }}>
                        Description
                    </span>
                    <p className="fs-5 mt-2">{product.description}</p>
                </div>
            </div>
            <Comments productId={product._id} />
        </>
    );
};

export const getServerSideProps = async (ctx) => {
    const { productId } = ctx.query;
    const { data, error } = await client.query({
        query: SINGLE_PRODUCT,
        variables: {
            productId,
        },
    });
    if (error) {
        return {
            props: {
                error: error.message,
            },
        };
    }
    return {
        props: {
            product: data.singleProduct,
        },
    };
};

export default SingleProduct;
