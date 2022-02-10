import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { GET_CATEGORY } from "../../queries/category";
import LoadingPage from "../../components/LoadingPage";
import CategoryProducts from "../../components/Category/CategoryProducts";

const CategoryPage = () => {
    const router = useRouter();
    const { loading, data, error } = useQuery(GET_CATEGORY, {
        variables: {
            category: router.query.category,
        },
    });

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div className="container">
            <p className="display-3 mb-1">
                Category : <span className="fw-bold">{data.getCategory.category} {" "}</span>
            </p>
            <span className="fs-5">( Found {data.getCategory.products} products )</span>
            <hr />
            <CategoryProducts categoryId={data.getCategory._id} />
        </div>
    );
};

export default CategoryPage;
