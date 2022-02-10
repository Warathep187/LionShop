import React from "react";
import { Rating } from "semantic-ui-react";
import Link from "next/link";
import calPrice from "../../utils/calulatePrice";

const RecommendedProducts = ({ products }) => {
    return (
        <div className="row">
            {products.map((product) => (
                <Link href={`/product/${product._id}`} key={product._id}>
                    <div
                        className="col-3 rounded-3 border border-3 shadow"
                        style={{ overflow: "hidden", cursor: "pointer" }}
                    >
                        <div className="w-100">
                            <img
                                src={product.coverImage.url}
                                style={{ height: "180px", objectFit: "cover" }}
                                alt="Image"
                                className="w-100"
                            />
                        </div>
                        <div className="w-100">
                            <p className="fs-3 mt-1 mb-3">
                                {product.name.length > 32
                                    ? product.name.slice(0, 30) + ".."
                                    : product.name}
                            </p>

                            <div className="my-3">
                                <div>
                                    <div className="d-flex">
                                        {product.multipleType ? (
                                            <div className="d-flex">
                                                <span className="badge bg-success p-2">
                                                    {calPrice(product.types)} THB
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="badge bg-success p-2">
                                                {product.type.price.toLocaleString()} THB
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mt-1">
                                    <span className="ms-2">
                                        <Rating
                                            icon="star"
                                            defaultRating={
                                                product.rating.ratings === 0
                                                    ? 0
                                                    : product.rating.sumPoint /
                                                      product.rating.ratings
                                            }
                                            maxRating={5}
                                            disabled
                                        />
                                        (
                                        {product.rating.ratings === 0
                                            ? 0
                                            : product.rating.sumPoint / product.rating.ratings}
                                        )
                                    </span>
                                    <span className="badge bg-secondary p-2">
                                        Sold {product.sold.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default RecommendedProducts;
