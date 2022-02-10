import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { SINGLE_PRODUCT } from "../../../queries/product";
import LoadingPage from "../../../components/LoadingPage";
import { Rating } from "semantic-ui-react";
import calPrice from "../../../utils/calulatePrice";
import Comments from "../../../components/Comment/Comments";

const SpecificProduct = () => {
    const router = useRouter();
    const { loading, data, error } = useQuery(SINGLE_PRODUCT, {
        variables: {
            productId: router.query.id,
        },
    });

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div className="container mb-4">
            {data && (
                <>
                    <div className="row mt-3">
                        <div className="col-6">
                            {data.singleProduct.images.length > 0 ? (
                                <div
                                    id="carouselExampleIndicators"
                                    className="carousel slide"
                                    data-bs-ride="carousel"
                                >
                                    <div className="carousel-indicators">
                                        {data.singleProduct.images.map((image, index) => (
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
                                        {data.singleProduct.images.map((image, index) => (
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
                                <div
                                    id="carouselExampleIndicators"
                                    className="carousel slide"
                                    data-bs-ride="carousel"
                                >
                                    <div className="carousel-indicators">
                                        <button
                                            type="button"
                                            data-bs-target="#carouselExampleIndicators"
                                            data-bs-slide-to={0}
                                            className="active"
                                            aria-current="true"
                                            aria-label="Slide 1"
                                        />
                                    </div>
                                    <div className="carousel-inner">
                                        <div className="carousel-item active">
                                            <img
                                                src={data.singleProduct.coverImage.url}
                                                className="d-block w-100"
                                                alt="image"
                                                style={{
                                                    height: "400px",
                                                    width: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="col-6">
                            <div className="text-break">
                                <p className="fs-1 fw-bold mb-1">{data.singleProduct.name}</p>
                                <hr />
                                <div className="d-flex align-items-center fs-5">
                                    <div className="d-flex align-items-center me-2">
                                        <Rating
                                            icon="star"
                                            defaultRating={
                                                data.singleProduct.rating.ratings === 0
                                                    ? 0
                                                    : data.singleProduct.rating.sumPoint /
                                                      data.singleProduct.rating.ratings
                                            }
                                            maxRating={5}
                                            size="large"
                                            disabled
                                        />
                                        <span>
                                            (
                                            {data.singleProduct.rating.ratings === 0
                                                ? 0
                                                : data.singleProduct.rating.sumPoint /
                                                  data.singleProduct.rating.ratings}
                                            )
                                        </span>
                                    </div>
                                    |
                                    <span className="mx-3">
                                        {data.singleProduct.rating.ratings} Ratings
                                    </span>
                                    |<span className="ms-3">{data.singleProduct.sold} Sold</span>
                                </div>
                            </div>
                            <div>
                                <div className="fs-3 my-3">
                                    <span>Price </span>
                                    {data.singleProduct.multipleType ? (
                                        <span className="fw-bolder text-success">
                                            {calPrice(data.singleProduct.types)}
                                        </span>
                                    ) : (
                                        <span className="fw-bolder text-success">
                                            {data.singleProduct.type.price.toLocaleString()}
                                        </span>
                                    )}{" "}
                                    THB
                                </div>
                                {data.singleProduct.multipleType ? (
                                    <div>
                                        {data.singleProduct.types.map((type) => (
                                            <p className="fs-5 my-1">
                                                <span className="fw-bolder">{type.type_}</span>
                                                {" : "}
                                                {type.amount === 0 ? (
                                                    <span className="text-danger">
                                                        Out of stock
                                                    </span>
                                                ) : (
                                                    <span>Available {type.amount} piece</span>
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="fs-5 my-1">
                                            {data.singleProduct.type.amount === 0 ? (
                                                <span>Out of stock</span>
                                            ) : (
                                                <span>
                                                    Available {data.singleProduct.type.amount} piece
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <div style={{ padding: "0 10rem" }}>
                        <span className="fs-3 fw-bold" style={{ textDecoration: "underline" }}>
                            Description
                        </span>
                        <p className="fs-5 mt-2">{data.singleProduct.description}</p>
                    </div>
                    <Comments productId={data.singleProduct._id} />
                </>
            )}
        </div>
    );
};

export default SpecificProduct;
