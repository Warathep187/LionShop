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

export default calPrice;