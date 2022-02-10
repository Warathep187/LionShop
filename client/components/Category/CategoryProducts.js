import { useQuery } from "@apollo/client";
import { PRODUCTS_IN_CATEGORY } from "../../queries/category";
import LoadingPage from "../LoadingPage";
import { Rating } from "semantic-ui-react";
import Link from "next/link";

const CategoryProducts = ({ categoryId }) => {
    const { loading, data, error } = useQuery(PRODUCTS_IN_CATEGORY, {
        variables: {
            categoryId,
        },
    });

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    const calPrice = (types) => {
        let max = 0;
        let min = 99999999999;
        for (const type of types) {
            if (type.price > max) {
                max = type.price;
            }
            if (type.price < min) {
                min = type.price;
            }
        }
        return `${min.toLocaleString()}-${max.toLocaleString()}`;
    };

    return (
        <div className="row">
            {data.productsInCategory.map((product) => (
                <Link href={`/product/${product._id}`} key={product._id}>
                    <div
                        className="col-3 rounded-3 border border-3 shadow"
                        style={{ cursor: "pointer" }}
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
                                <a style={{ color: "black", cursor: "pointer" }}>
                                    {product.name.length > 32
                                        ? product.name.slice(0, 30) + ".."
                                        : product.name}
                                </a>
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

export default CategoryProducts;
