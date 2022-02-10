const createPaymentValidator = ({ productList, fullName, address, tel, image }) => {
    try {
        const pureImageBase64 = image.replace(/^data:image\/\w+;base64,/, "");
        if (!Array.isArray(productList)) {
            throw new Error("Products that you want to buy must be a list");
        } else if (productList.length === 0) {
            throw new Error("Product is required");
        }
        for (const id of productList) {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error("Invalid id");
            }
        }
        if (!fullName || fullName.trim() === "") {
            throw new Error("Name must be provided");
        } else if (!address || address.trim() === "") {
            throw new Error("Address must be provided");
        } else if (!tel || tel.trim() === "") {
            throw new Error("Telephone number must be provided");
        } else if (tel.trim().length < 9 || tel.trim().length > 12) {
            throw new Error("Telephone number is invalid format");
        }else if (!image) {
            throw new Error("Slip is required");
        } else if (
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                pureImageBase64
            )
        ) {
            throw new Error("Slip image is invalid format");
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = { createPaymentValidator };
