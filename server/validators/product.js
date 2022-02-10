const productValidator = async ({
    name,
    description,
    coverImage,
    images,
    category,
    multipleType,
    types,
    type,
}) => {
    try {
        const pureCoverImageBase64 = coverImage.replace(/^data:image\/\w+;base64,/, "");
        if (!name || name.trim() === "") {
            throw new Error("Product name must be provided");
        } else if (!description || description.trim() === "") {
            throw new Error("Description name must be provided");
        } else if (!coverImage) {
            throw new Error("Cover image must be uploaded");
        } else if (
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                pureCoverImageBase64
            )
        ) {
            throw new Error("Cover image is invalid format");
        } else if (!Array.isArray(images) && images.length > 0) {
            for (const image of images) {
                const pureImageBase64 = image.replace(/^data:image\/\w+;base64,/, "");
                if (
                    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                        pureImageBase64
                    )
                ) {
                    throw new Error("Image is invalid format. Please try again");
                }
            }
        } else if (!category) {
            throw new Error("Category must selected");
        } else if (!category.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Category is invalid");
        } else if (typeof multipleType != "boolean") {
            throw new Error("Type of product must be provided");
        } else if (typeof multipleType == "boolean") {
            if (multipleType) {
                for (const type of types) {
                    if (type.type_.trim() === "") {
                        throw new Error("Type must be provided");
                    } else if (isNaN(parseInt(type.price))) {
                        throw new Error("Price must be a number");
                    } else if (parseInt(type.price) < 1) {
                        throw new Error("Price must be at least 1 THB");
                    } else if (isNaN(parseInt(type.amount))) {
                        throw new Error("Amount must be a number");
                    } else if (parseInt(type.amount) < 1) {
                        throw new Error("Amount must be at least 1 piece");
                    }
                }
            } else {
                if (isNaN(parseInt(type.price))) {
                    throw new Error("Price must be a number");
                } else if (parseInt(type.price) < 1) {
                    throw new Error("Price must be at least 1 THB");
                } else if (isNaN(parseInt(type.amount))) {
                    throw new Error("Amount must be a number");
                } else if (parseInt(type.amount) < 1) {
                    throw new Error("Amount must be at least 1 piece");
                }
            }
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

const updateProductValidator = async ({
    _id,
    name,
    description,
    coverImage,
    images,
    category,
    multipleType,
    types,
    type,
}) => {
    try {
        const pureCoverImageBase64 = coverImage.replace(/^data:image\/\w+;base64,/, "");
        if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Invalid product id");
        } else if (!name || name.trim() === "") {
            throw new Error("Product name must be provided");
        } else if (!description || description.trim() === "") {
            throw new Error("Description name must be provided");
        } else if (
            coverImage.trim() !== "" &&
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                pureCoverImageBase64
            )
        ) {
            throw new Error("Cover image is invalid format");
        } else if (!Array.isArray(images)) {
            throw new Error("Images must be an array");
        }
        for (const image of images) {
            const pureImageBase64 = image.replace(/^data:image\/\w+;base64,/, "");
            if (
                !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                    pureImageBase64
                )
            ) {
                throw new Error("Image is invalid format. Please try again");
            }
        }
        if (!category) {
            throw new Error("Category must selected");
        } else if (!category.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("Category is invalid");
        } else if (typeof multipleType != "boolean") {
            throw new Error("Type of product must be provided");
        } else if (typeof multipleType == "boolean") {
            if (multipleType) {
                for (const type of types) {
                    if (type.type_.trim() === "") {
                        throw new Error("Type must be provided");
                    } else if (isNaN(parseInt(type.price))) {
                        throw new Error("Price must be a number");
                    } else if (parseInt(type.price) < 0) {
                        throw new Error("Price must be at least 0 THB");
                    } else if (isNaN(parseInt(type.amount))) {
                        throw new Error("Amount must be a number");
                    } else if (parseInt(type.amount) < 0) {
                        throw new Error("Amount must be at least 0 piece");
                    }
                }
            } else {
                if (isNaN(parseInt(type.price))) {
                    throw new Error("Price must be a number");
                } else if (parseInt(type.price) < 0) {
                    throw new Error("Price must be at least 0 THB");
                } else if (isNaN(parseInt(type.amount))) {
                    throw new Error("Amount must be a number");
                } else if (parseInt(type.amount) < 0) {
                    throw new Error("Amount must be at least 0 piece");
                }
            }
        } else if (typeof multipleType !== "boolean") {
            throw new Error("Please chooses multiple type or single type");
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = { productValidator, updateProductValidator };
