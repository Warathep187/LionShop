import { useQuery, useMutation } from "@apollo/client";
import { ALL_PRODUCTS, DELETE_PRODUCT } from "../../../queries/admin";
import calPrice from "../../../utils/calulatePrice";
import { Rating, Icon } from "semantic-ui-react";
import { toast } from "react-toastify";
import Link from "next/link";
import LoadingPage from "../../../components/LoadingPage";
import { useRouter } from "next/router";
import swal from "sweetalert";

const products = () => {
    const router = useRouter();
    const [deleteProduct] = useMutation(DELETE_PRODUCT, {
        update: (res, { data }) => toast("Deleted"),
        onError: (err) => toast.error(err.message),
    });
    const { loading, data, error } = useQuery(ALL_PRODUCTS);

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        router.back();
        return <p>{error.message}</p>;
    }

    const removeProductHandler = (productId) => {
        swal({
            title: "Are you sure you want to remove this product?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                deleteProduct({
                    variables: {
                        input: productId,
                    },
                    refetchQueries: [
                        {
                            query: ALL_PRODUCTS,
                        },
                    ],
                });
            }
        });
    };

    return (
        <>
            <div>
                <div className="w-100">
                    <div className="d-flex align-items-baseline justify-content-between">
                        <p className="display-4">Products</p>
                        <div className="me-3">
                            <Link href="/admin/products/create">
                                <a className="fs-4" style={{ cursor: "pointer" }}>
                                    Add <Icon name="add" size="large" />
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {data.allProducts.map((product) => (
                        <div
                            className="col-3 rounded-3 border border-3 shadow"
                            key={product._id}
                            style={{ overflow: "hidden", position: "relative" }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: "5px",
                                    right: "5px",
                                    zIndex: "100",
                                }}
                            >
                                <Icon
                                    bordered
                                    inverted
                                    name="edit"
                                    size="large"
                                    className="rounded-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                                />
                                <Icon
                                    bordered
                                    inverted
                                    name="trash alternate"
                                    size="large"
                                    className="rounded-2"
                                    onClick={() => removeProductHandler(product._id)}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                            <div className="w-100">
                                <img
                                    src={product.coverImage.url}
                                    style={{ height: "180px", objectFit: "cover" }}
                                    alt="Image"
                                    className="w-100"
                                />
                            </div>
                            <div className="w-100">
                                <Link href={`/admin/products/${product._id}`}>
                                    <p className="fs-3 mt-1 mb-3">
                                        <a style={{ color: "black", cursor: "pointer" }}>
                                            {product.name.length > 32
                                                ? product.name.slice(0, 30) + ".."
                                                : product.name}
                                        </a>
                                    </p>
                                </Link>
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
                                                defaultRating={product.rating.ratings === 0 ? 0: product.rating.sumPoint / product.rating.ratings}
                                                maxRating={5}
                                                disabled
                                            />
                                            ({product.rating.ratings === 0 ? 0: product.rating.sumPoint / product.rating.ratings})
                                        </span>
                                        <span className="badge bg-secondary p-2">
                                            Sold {product.sold.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default products;
