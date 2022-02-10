import React from "react";
import { useQuery } from "@apollo/client";
import { CATEGORIES_POPUP } from "../../queries/category";

const AdminCategoryInput = ({selectedCategory, setData}) => {
    const { loading, data, error } = useQuery(CATEGORIES_POPUP);

    if (loading) {
        return (
            <div className="spinner-border text-primary text-center" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <select
            className="form-select"
            aria-label="Default select example"
            onChange={(e) => setData((prev) => ({ ...prev, category: e.target.value }))}
            value={selectedCategory}
        >
            {data.categories.map((category) => (
                <option value={category._id} key={category._id}>
                    {category.category}
                </option>
            ))}
        </select>
    );
};

export default AdminCategoryInput;
