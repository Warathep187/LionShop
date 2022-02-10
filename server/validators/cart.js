const addToCartValidator = async ({product, type, price, amount}) => {
    if(!product.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid product id");
    }else if(isNaN(parseInt(price))) {
        throw new Error("Invalid price");
    }else if(parseInt(price) < 1) {
        throw new Error("Price must not be less than 1 THB");
    }else if(isNaN(parseInt(amount))) {
        throw new Error("Invalid amount");
    }else if(parseInt(amount) < 1) {
        throw new Error("Amount must not be less than 1 THB");
    }
    return {
        price: parseInt(price),
        amount: parseInt(amount)
    }
}

module.exports = {addToCartValidator}