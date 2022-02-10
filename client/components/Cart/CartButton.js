import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cartAction } from "../../store/index";
import { GET_CART_ITEMS } from "../../queries/cart";
import { useQuery } from "@apollo/client";
import { Icon } from "semantic-ui-react";
import { useRouter } from "next/router";

const CartButton = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { items } = useSelector((state) => state.cartSlice);
    const [isRendered, setIsRendered] = useState(false);
    const { loading, data, error } = useQuery(GET_CART_ITEMS);

    if (loading) {
        return (
            <button
                type="button"
                className="btn btn-outline-warning position-relative px-5 py-2 rounded-pill"
                disabled
            >
                <Icon name="cart" size="small" />
                Loading..
            </button>
        );
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    if (!isRendered) {
        dispatch(cartAction.setInitialCart(data.cart));
        setIsRendered(true);
    }

    return (
        <>
            <a href="/cart">
                <button
                    type="button"
                    className="btn btn-outline-warning position-relative px-5 py-2 rounded-pill"
                >
                    <Icon name="cart" color="yellow" size="large" />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-2">
                        {items.length}
                    </span>
                </button>
            </a>
        </>
    );
};

export default CartButton;
