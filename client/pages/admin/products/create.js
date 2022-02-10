import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import imageResizer from "../../../utils/imageResizer";
import AdminTopNav from "../../../components/Navs/AdminTopNav";
import { Form, Icon } from "semantic-ui-react";
import CategoryInput from "../../../components/Category/CategoryInput";
import { useRouter } from "next/router";
import { CREATE_PRODUCT } from "../../../queries/admin";

const create = () => {
    const router = useRouter();
    const [data, setData] = useState({
        name: "",
        description: "",
        coverImage: "",
        images: [],
        category: "",
        multipleType: false,
        types: [
            {
                type_: "",
                price: 0,
                amount: 0,
            },
        ],
        type: {
            price: 0,
            amount: 0,
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const [coverImagePreview, setCoverImagePreview] = useState(null);

    const [createProduct] = useMutation(CREATE_PRODUCT, {
        update: (res, { data }) => {
            toast(data.createProduct);
            setData({
                name: "",
                description: "",
                coverImage: "",
                images: [],
                category: "",
                multipleType: false,
                types: [
                    {
                        type_: "",
                        price: 0,
                        amount: 0,
                    },
                ],
                type: {
                    price: 0,
                    amount: 0,
                },
            });
            setCoverImagePreview(null);
        },
        onError: (err) => toast.error(err.message),
    });

    const { name, description, coverImage, images, category, multipleType, types, type } = data;

    const dataChangeHandler = (e) => {
        const { value, name } = e.target;
        setData({ ...data, [name]: value });
    };

    const coverImageChangeHandler = async (e) => {
        try {
            const file = e.target.files[0];
            const base64 = await imageResizer(file, 300, 300);
            setData({
                ...data,
                coverImage: base64,
            });
            setCoverImagePreview(URL.createObjectURL(file));
        } catch (e) {
            setCoverImagePreview(null);
            toast.error(e.message);
        }
    };

    const imagesChangeHandler = async (e) => {
        try {
            const files = e.target.files;
            const imagesList = [];
            for (const file of files) {
                const image = await imageResizer(file, 400, 400);
                imagesList.push(image);
            }
            setData({ ...data, images: imagesList });
        } catch (e) {
            toast.error(e.message);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const pureCoverImageBase64 = coverImage.replace(/^data:image\/\w+;base64,/, "");
        if (!name || name.trim() === "") {
            toast.error("Product name must be provided");
        } else if (!description || description.trim() === "") {
            toast.error("Description name must be provided");
        } else if (!category) {
            toast.error("Category must selected");
        } else if (!category.match(/^[0-9a-fA-F]{24}$/)) {
            toast.error("Category is invalid");
        } else if (!coverImage) {
            toast.error("Cover image must be uploaded");
        } else if (
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                pureCoverImageBase64
            )
        ) {
            toast.error("Cover image is invalid format");
        } else if (!Array.isArray(images) && images.length > 0) {
            for (const image of images) {
                const pureImageBase64 = image.replace(/^data:image\/\w+;base64,/, "");
                if (
                    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                        pureImageBase64
                    )
                ) {
                    toast.error("Image is invalid format. Please try again");
                }
            }
        } else if (typeof multipleType != "boolean") {
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
                    } else if (parseInt(type.amount) < 1) {
                        return toast.error("Amount must be at least 1 piece");
                    }
                }
                await createProduct({
                    variables: {
                        input: {
                            ...data,
                            types: types.map((type) => ({
                                ...type,
                                price: parseInt(type.price),
                                amount: parseInt(type.amount),
                            })),
                            type: {
                                price: parseInt(type.price),
                                amount: parseInt(type.amount),
                            },
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
                } else if (parseInt(type.amount) < 1) {
                    toast.error("Amount must be at least 1 piece");
                } else {
                    await createProduct({
                        variables: {
                            input: {
                                ...data,
                                types: types.map((type) => ({
                                    ...type,
                                    price: parseInt(type.price),
                                    amount: parseInt(type.amount),
                                })),
                                type: {
                                    price: parseInt(type.price),
                                    amount: parseInt(type.amount),
                                },
                            },
                        },
                    });
                }
            }
        }
        setIsLoading(false);
    };

    return (
        <>
            <div className="px-3">
                <div>
                    <p className="display-4">Create Product</p>
                    <hr />
                </div>
                <Form onSubmit={submitHandler} loading={isLoading}>
                    <div className="row">
                        <div className="col-8">
                            <div className="input-group mb-3">
                                <label htmlFor="name">Product name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={name}
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <div className="input-group mb-3">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    type="text"
                                    name="description"
                                    id="description"
                                    value={description}
                                    onChange={dataChangeHandler}
                                    row={10}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label>Choose Category</label>
                                <CategoryInput setData={setData} categoryValue={category} />
                            </div>
                            <div className="form-group mb-3">
                                <div className="p-3 border border-secondary rounded-2">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="flexRadio"
                                                id="flexRadioDefault1"
                                                onClick={() => {
                                                    setData({
                                                        ...data,
                                                        types: [{ type_: "", price: 0, amount: 0 }],
                                                        multipleType: false,
                                                    });
                                                }}
                                                defaultChecked
                                                checked={!multipleType}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="flexRadioDefault1"
                                            >
                                                Single types
                                            </label>
                                        </div>
                                        <div className="form-check ms-3">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="flexRadio"
                                                id="flexRadioDefault2"
                                                onClick={() =>
                                                    setData({
                                                        ...data,
                                                        type: { price: 0, amount: 0 },
                                                        multipleType: true,
                                                    })
                                                }
                                                checked={multipleType}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="flexRadioDefault2"
                                            >
                                                Multiple type
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        {multipleType ? (
                                            <div>
                                                <div className="mb-2">
                                                    <Icon
                                                        name="add"
                                                        size="large"
                                                        color="green"
                                                        inverted
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            if (types.length === 8) {
                                                                return toast.error("Max is 8");
                                                            }
                                                            setData({
                                                                ...data,
                                                                types: [
                                                                    ...types,
                                                                    {
                                                                        type_: "",
                                                                        price: 0,
                                                                        amount: 0,
                                                                    },
                                                                ],
                                                            });
                                                        }}
                                                    />
                                                    <Icon
                                                        name="minus"
                                                        size="large"
                                                        color="red"
                                                        inverted
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            if (types.length === 1) {
                                                                return toast.error("Min is 1");
                                                            }
                                                            const after = types.slice(0, -1);
                                                            setData({
                                                                ...data,
                                                                types: after,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                {types.map((type, index) => (
                                                    <div
                                                        className="d-flex align-items-center mb-2"
                                                        key={index}
                                                    >
                                                        <div className="form-group w-50">
                                                            <label htmlFor={`type${index}`}>
                                                                Type
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="type"
                                                                id={`type${index}`}
                                                                onChange={(e) => {
                                                                    const temp = types;
                                                                    temp[index].type_ =
                                                                        e.target.value;
                                                                    setData({
                                                                        ...data,
                                                                        types: temp,
                                                                    });
                                                                }}
                                                                value={types[index].type_}
                                                            />
                                                        </div>
                                                        <div className="form-group w-25">
                                                            <label htmlFor={`price${index}`}>
                                                                Price
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="price"
                                                                id={`price${index}`}
                                                                onChange={(e) => {
                                                                    const temp = types;
                                                                    temp[index].price =
                                                                        e.target.value;
                                                                    setData({
                                                                        ...data,
                                                                        types: temp,
                                                                    });
                                                                }}
                                                                value={types[index].price}
                                                            />
                                                        </div>
                                                        <div className="form-group w-25">
                                                            <label htmlFor={`amount${index}`}>
                                                                Amount
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className="form-control ms-2"
                                                                placeholder="amount"
                                                                id={`amount${index}`}
                                                                onChange={(e) => {
                                                                    const temp = types;
                                                                    temp[index].amount =
                                                                        e.target.value;
                                                                    setData({
                                                                        ...data,
                                                                        types: temp,
                                                                    });
                                                                }}
                                                                value={types[index].amount}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center">
                                                <div className="form-group w-75">
                                                    <label htmlFor="price">Price</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="price"
                                                        id="price"
                                                        onChange={(e) =>
                                                            setData({
                                                                ...data,
                                                                type: {
                                                                    ...type,
                                                                    price: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        value={type.price}
                                                    />
                                                </div>
                                                <div className="form-group w-25">
                                                    <label htmlFor="price">Amount</label>
                                                    <input
                                                        type="number"
                                                        className="form-control ms-2"
                                                        placeholder="amount"
                                                        id="amount"
                                                        min={0}
                                                        onChange={(e) =>
                                                            setData({
                                                                ...data,
                                                                type: {
                                                                    ...type,
                                                                    amount: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        value={type.amount}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="form-group mb-3">
                                <label htmlFor="cover">Cover image</label>
                                <input
                                    type="file"
                                    className="form-control mb-1"
                                    id="cover"
                                    onChange={coverImageChangeHandler}
                                    accept="image/*"
                                />
                                {coverImagePreview && (
                                    <img
                                        src={coverImagePreview}
                                        alt="preview"
                                        style={{
                                            width: "300px",
                                            maxHeight: "300px",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="images">Other Images</label>
                                <input
                                    type="file"
                                    className="form-control mb-1"
                                    id="images"
                                    onChange={imagesChangeHandler}
                                    accept="image/*"
                                    multiple
                                />
                            </div>
                            <button className="btn btn-primary px-3" disabled={isLoading}>
                                {isLoading ? "Creating" : "Create"}
                            </button>
                        </div>
                    </div>
                </Form>
            </div>
        </>
    );
};

export default create;
