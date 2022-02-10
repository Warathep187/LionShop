import { useState } from "react";
import { Icon, Form } from "semantic-ui-react";
import AdminCategoryInput from "../../components/Category/AdminCategoryInput";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { REMOVE_IMAGE, UPDATE_PRODUCT } from "../../queries/admin";
import imageResizer from "../../utils/imageResizer";
import {useRouter} from "next/router";

const EditProductForm = ({ productData }) => {
    const router = useRouter();
    const [data, setData] = useState({
        ...productData,
        coverImage: "",
        images: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const { _id, name, description, category, multipleType, types, type, coverImage, images } =
        data;

    const [imagePreview, setImagePreview] = useState(productData.coverImage.url);
    const [imagesList, setImagesList] = useState(productData.images);

    const [removeImage] = useMutation(REMOVE_IMAGE, {
        update: (res, { data }) => {
            setImagesList(imagesList.filter((image) => image.public_id !== data.removeImage));
            setIsLoading(false);
        },
        onError: (error) => toast.error(error.message),
    });

    const [updateProduct] = useMutation(UPDATE_PRODUCT, {
        update: (res, { data }) => {
            toast(data.updateProduct);
            router.reload(window.location.pathname);
        },
        onError: (err) => toast.error(err.message),
    });

    const removeImageHandler = async (productId, public_id) => {
        setIsLoading(true);
        await removeImage({
            variables: {
                input: {
                    public_id,
                    productId,
                },
            },
        });
    };

    const dataChangeHandler = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value,
        });
    };

    const coverImageChangeHandler = async (e) => {
        try {
            const file = e.target.files[0];
            const image = await imageResizer(file, 300, 300);
            setData({
                ...data,
                coverImage: image,
            });
            setImagePreview(URL.createObjectURL(file));
        } catch (e) {
            toast.error(e.message);
        }
    };

    const imagesChangeHandler = async (e) => {
        try {
            const files = e.target.files;
            const imagesArray = [];
            for (const file of files) {
                const image = await imageResizer(file, 400, 400);
                imagesArray.push(image);
            }
            setData({ ...data, images: imagesArray });
        } catch (e) {
            toast.error(e.message);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const pureCoverImageBase64 = coverImage.replace(/^data:image\/\w+;base64,/, "");
        if (!name || name.trim() === "") {
            setIsLoading(false);
            return toast.error("Product name must be provided");
        } else if (!description || description.trim() === "") {
            setIsLoading(false);
            return toast.error("Description name must be provided");
        } else if (!category) {
            setIsLoading(false);
            return toast.error("Category must selected");
        } else if (!category.match(/^[0-9a-fA-F]{24}$/)) {
            setIsLoading(false);
            return toast.error("Category is invalid");
        } else if (
            coverImage.trim() !== "" &&
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                pureCoverImageBase64
            )
        ) {
            setIsLoading(false);
            return toast.error("Cover image is invalid format");
        } else if (!Array.isArray(images)) {
            setIsLoading(false);
            return toast.error("Image format is not supported");
        }
        for (const image of images) {
            const pureImageBase64 = image.replace(/^data:image\/\w+;base64,/, "");
            if (
                !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                    pureImageBase64
                )
            ) {
                setIsLoading(false);
                return toast.error("Image is invalid format. Please try again");
            }
        }
        if (typeof multipleType != "boolean") {
            toast.error("Type of product must be provided");
        } else if (typeof multipleType == "boolean") {
            if (multipleType) {
                for (const type of types) {
                    if (type.type_.trim() === "") {
                        return toast.error("Type must be provided");
                    } else if (isNaN(parseInt(type.price))) {
                        return toast.error("Price must be a number");
                    } else if (parseInt(type.price) < 1) {
                        return toast.error("Price must be at least 1 THB");
                    } else if (isNaN(parseInt(type.amount))) {
                        return toast.error("Amount must be a number");
                    } else if (parseInt(type.amount) < 0) {
                        return toast.error("Amount must be at least 0 piece");
                    }
                }
                await updateProduct({
                    variables: {
                        input: {
                            ...data,
                            types: types.map((type) => ({
                                ...type,
                                price: parseInt(type.price),
                                amount: parseInt(type.amount),
                                __typename: undefined
                            })),
                            type: {
                                price: parseInt(type.price),
                                amount: parseInt(type.amount),
                            },
                            __typename: undefined,
                        },
                    },
                });
            } else {
                if (isNaN(parseInt(type.price))) {
                    toast.error("Price must be a number");
                } else if (parseInt(type.price) < 1) {
                    toast.error("Price must be at least 1 THB");
                } else if (isNaN(parseInt(type.amount))) {
                    toast.error("Amount must be a number");
                } else if (parseInt(type.amount) < 0) {
                    toast.error("Amount must be at least 0 piece");
                } else {
                    await updateProduct({
                        variables: {
                            input: {
                                ...data,
                                types: types.map((type) => ({
                                    ...type,
                                    price: parseInt(type.price),
                                    amount: parseInt(type.amount),
                                    __typename: undefined
                                })),
                                type: {
                                    price: parseInt(type.price),
                                    amount: parseInt(type.amount),
                                },
                                __typename: undefined,
                            },
                        },
                    });
                }
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="row">
            <div className="col-7 px-5">
                <div className="form-floating mb-3">
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        id="name"
                        placeholder="Product"
                        value={name}
                        onChange={dataChangeHandler}
                    />
                    <label htmlFor="name">Product name</label>
                </div>
                <div className="form-floating mb-3">
                    <textarea
                        className="form-control"
                        placeholder="Description"
                        id="floatingTextarea"
                        name="description"
                        style={{ height: "12rem" }}
                        value={description}
                        onChange={dataChangeHandler}
                    />
                    <label htmlFor="floatingTextarea">Description</label>
                </div>
                <div className="mb-3">
                    <AdminCategoryInput selectedCategory={category} setData={setData} />
                </div>
                <div className="mb-3">
                    <p className="mb-0">{multipleType ? "Multiple Type" : "Single Type"}</p>
                    <div>
                        {multipleType ? (
                            <div>
                                {types.map((type, index) => (
                                    <div
                                        className="d-flex align-items-center mb-1"
                                        key={type.type_}
                                    >
                                        <input
                                            type="text"
                                            className="form-control w-50"
                                            placeholder="Type"
                                            value={type.type_}
                                            onChange={(e) => {
                                                const edited = types.map((t, i) => {
                                                    if (i === index) {
                                                        return {
                                                            ...t,
                                                            type_: e.target.value,
                                                        };
                                                    }
                                                    return t;
                                                });
                                                setData({
                                                    ...data,
                                                    types: edited,
                                                });
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="form-control w-25 mx-1"
                                            placeholder="Price"
                                            min="0"
                                            value={type.price}
                                            onChange={(e) => {
                                                const edited = types.map((t, i) => {
                                                    if (i === index) {
                                                        return {
                                                            ...t,
                                                            price: e.target.value,
                                                        };
                                                    }
                                                    return t;
                                                });
                                                setData({
                                                    ...data,
                                                    types: edited,
                                                });
                                            }}
                                        />
                                        <input
                                            type="number"
                                            className="form-control w-25"
                                            placeholder="Amount"
                                            min="0"
                                            value={type.amount}
                                            onChange={(e) => {
                                                const edited = types.map((t, i) => {
                                                    if (i === index) {
                                                        return {
                                                            ...t,
                                                            amount: e.target.value,
                                                        };
                                                    }
                                                    return t;
                                                });
                                                setData({
                                                    ...data,
                                                    types: edited,
                                                });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="d-flex align-items-center">
                                <input
                                    type="text"
                                    className="form-control w-50 me-1"
                                    placeholder="Price"
                                    min="0"
                                    value={type.price}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            type: {
                                                ...type,
                                                price: e.target.value,
                                            },
                                        })
                                    }
                                />
                                <input
                                    type="number"
                                    className="form-control w-50"
                                    placeholder="Amount"
                                    min="0"
                                    value={type.amount}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            type: {
                                                ...type,
                                                amount: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-5 pe-4">
                <div className="mb-3">
                    <span className="mb-1">Cover image</span>
                    <input
                        type="file"
                        className="form-control w-50"
                        accept="image/*"
                        onChange={coverImageChangeHandler}
                    />
                    <div>
                        <img
                            src={imagePreview}
                            style={{ width: "12rem", height: "12rem", objectFit: "cover" }}
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <div>
                        <span className="mb-1">Images</span>
                        <input
                            type="file"
                            className="form-control w-50"
                            accept="images/*"
                            onChange={imagesChangeHandler}
                            multiple
                        />
                    </div>
                    <Form loading={isLoading} className="mt-2 d-flex flex-wrap">
                        {imagesList.map((image) => (
                            <div className="position-relative border ms-2" key={image.public_id}>
                                <img
                                    src={image.url}
                                    alt="image"
                                    style={{
                                        width: "150px",
                                        height: "150px",
                                        objectFit: "cover",
                                    }}
                                />
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "3px",
                                        right: "0",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Icon
                                        name="x"
                                        size="large"
                                        color="red"
                                        onClick={() => removeImageHandler(_id, image.public_id)}
                                    />
                                </span>
                            </div>
                        ))}
                    </Form>
                </div>
                <div className="text-end pb-4">
                    <button className="btn btn-outline-primary px-5 py-2" onClick={submitHandler} disabled={isLoading || !name || !description}>
                        {isLoading ? "Updating.." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductForm;
