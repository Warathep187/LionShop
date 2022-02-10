import { useState } from "react";
import { useMutation } from "@apollo/client";
import client from "../../apollo-client";
import AdminTopNav from "../../components/Navs/AdminTopNav";
import { CATEGORIES } from "../../queries/admin";
import moment from "moment";
import { Icon, Form } from "semantic-ui-react";
import { useRouter } from "next/router";
import { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from "../../queries/admin";
import { toast } from "react-toastify";

const categories = ({ allCategories, error }) => {
    const [categories, setCategories] = useState(allCategories);
    const [isLoading, setIsLoading] = useState(false);

    const [newCategory, setNewCategory] = useState("");

    const [displayData, setDisplayData] = useState({
        _id: "",
        category: "",
        products: 0,
        createdAt: Date.now(),
    });
    const { _id, category } = displayData;

    const [createCategory] = useMutation(CREATE_CATEGORY, {
        update: (res, { data }) => {
            toast("Created");
            setCategories([...categories, data.createCategory]);
        },
        onError: (err) => toast.error(err.message),
    });

    const [updateCategory] = useMutation(UPDATE_CATEGORY, {
        update: (res, { data }) => {
            toast("Updated");
            const newUpdate = categories.map((category) => {
                if (category._id == data.updateCategory) {
                    return displayData;
                } else {
                    return category;
                }
            });
            setCategories(newUpdate);
        },
        onError: (err) => toast.error(err.message),
    });

    const [deleteCategory] = useMutation(DELETE_CATEGORY, {
        update: (res, { data }) => {
            toast("Deleted");
            const filtered = categories.filter((val) => val._id !== data.deleteCategory);
            setCategories(filtered);
        },
        onError: (err) => toast.error(err.message),
    });

    const showModal = (id) => {
        setDisplayData(categories.filter((category) => category._id === id)[0]);
    };

    const removeCategory = async (id) => {
        const answer = window.confirm("Are your sure?");
        if (answer) {
            deleteCategory({
                variables: {
                    input: id,
                },
            });
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (category.trim() === "") {
            toast.error("Category must be provided");
        } else {
            await updateCategory({
                variables: {
                    input: {
                        categoryId: _id,
                        category: category,
                    },
                },
            });
        }
        setIsLoading(false);
    };

    const createCategoryHandler = async (e) => {
        setIsLoading(true);
        if (newCategory.trim() === "") {
            toast.error("Category must be provided");
        } else {
            await createCategory({
                variables: {
                    input: {
                        category: newCategory.trim(),
                    },
                },
            });
        }
        setNewCategory("");
        setIsLoading(false);
    };

    return (
        <>
            <div
                className="modal fade"
                id="CategoryModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                Modal title
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            <Form loading={isLoading} onSubmit={submitHandler}>
                                <div className="my-4">
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) =>
                                            setDisplayData({
                                                ...displayData,
                                                category: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </Form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                disabled={isLoading || !category}
                                onClick={submitHandler}
                            >
                                {isLoading ? "Updating.." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {error && <p>{error}</p>}
            <div className="pe-4">
                <div className="pb-5 px-4 border shadow w-50">
                    <Form loading={isLoading} onSubmit={createCategoryHandler}>
                        <p className="display-6">Create category</p>
                        <div className="mx-3">
                            <input
                                type="text"
                                className="form-control me-3"
                                onChange={(e) => setNewCategory(e.target.value)}
                                value={newCategory}
                            />
                            <button className="btn btn-primary mt-3 px-4">Create</button>
                        </div>
                    </Form>
                </div>
                <div className="mt-3 px-2">
                    {categories && (
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">Category</th>
                                    <th scope="col">Products</th>
                                    <th scope="col">Created At</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category._id}>
                                        <td>{category.category}</td>
                                        <td>{category.products}</td>
                                        <td>
                                            {moment(category.createdAt).format("DD / MM / YYYY")}
                                        </td>
                                        <td>
                                            <Icon
                                                name="edit"
                                                size="large"
                                                onClick={() => showModal(category._id)}
                                                data-bs-target="#CategoryModal"
                                                data-bs-toggle="modal"
                                                style={{ cursor: "pointer" }}
                                            />
                                            <Icon
                                                name="trash alternate"
                                                size="large"
                                                onClick={() => removeCategory(category._id)}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export const getServerSideProps = async () => {
    const { data, error } = await client.query({
        query: CATEGORIES,
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
            allCategories: data.categories,
        },
    };
};

export default categories;
