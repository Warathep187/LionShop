import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { Form } from "semantic-ui-react";
import renderHTML from "react-render-html";
import { useRouter } from "next/router";
import { CREATE_PAYMENT } from "../../queries/payment";
import imageResizer from "../../utils/imageResizer";
import { toast } from "react-toastify";
import {useDispatch} from "react-redux";
import {cartAction} from "../../store/index";

const OrderList = ({ order: { items, qrcode }}) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [createPayment] = useMutation(CREATE_PAYMENT, {
        update: (res, { data }) => {
            toast(data.createPayment);
            router.push("/payment");
        },
        onError: (err) => toast.error(err.message),
    });

    const [data, setData] = useState({
        fullName: "",
        address: "",
        tel: "",
        image: "",
    });
    const { fullName, address, tel, image } = data;
    const [isLoading, setIsLoading] = useState(false);

    const result = () => {
        let sum = 0;
        for (const item of items) {
            sum += item.price * item.amount;
        }
        return sum.toLocaleString();
    };

    const dataChangeHandler = async (e) => {
        const { name } = e.target;
        if (name === "image") {
            const file = e.target.files[0];
            const image = await imageResizer(file, 400, 400);
            setData({
                ...data,
                image,
            });
        } else {
            setData({
                ...data,
                [name]: e.target.value,
            });
        }
    };

    const buyingHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const productList = items.map((item) => item._id);
        const pureImageBase64 = image.replace(/^data:image\/\w+;base64,/, "");
        if (!Array.isArray(productList)) {
            setIsLoading(false);
            return toast.error("Products that you want to buy must be a list");
        } else if (productList.length === 0) {
            setIsLoading(false);
            return toast.error("Product is required");
        }
        for (const id of productList) {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                setIsLoading(false);
                return toast.error("Invalid id");
            }
        }
        if (!fullName || fullName.trim() === "") {
            toast.error("Name must be provided");
        } else if (!address || address.trim() === "") {
            toast.error("Address must be provided");
        } else if (!tel || tel.trim() === "") {
            toast.error("Telephone number must be provided");
        } else if (tel.trim().length < 9 || tel.trim().length > 12) {
            toast.error("Telephone number is invalid format");
        } else if (!image) {
            toast.error("Slip is required");
        } else if (
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                pureImageBase64
            )
        ) {
            toast.error("Slip image is invalid format");
        } else {
            await createPayment({
                variables: {
                    input: {
                        ...data,
                        productList,
                    },
                },
            });
            dispatch(cartAction.removeSpecificItems(productList))
        }
        setIsLoading(false);
    };

    return (
        <div className="w-100">
            <p className="fs-4 fw-bold mb-0">รายการที่ซื้อ</p>
            <hr />
            <div>
                {items.length === 0 ? (
                    <p className="mx-auto">ยังไม่มีรายการ</p>
                ) : (
                    <table className="table table-secondary table-hover table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Product</th>
                                <th scope="col">Type</th>
                                <th scope="col">Price(THB)</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Result(THB)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item._id}>
                                    <td>
                                        <Link href={`/product/${item.product._id}`}>
                                            {item.product.name.length > 8
                                                ? item.product.name.slice(0, 6) + ".."
                                                : item.product.name}
                                        </Link>
                                    </td>
                                    <td>{item.type_ ? item.type_ : "-"}</td>
                                    <td>{item.price.toLocaleString()}</td>
                                    <td>{item.amount}</td>
                                    <td>{(item.price * item.amount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="text-start">
                    <p className="fs-5">ยอดรวม {result()} บาท</p>
                </div>
                {items.length > 0 && (
                    <div className="w-75 p-3 border border-2 rounded-2 my-3">
                        <div className="w-75">{qrcode && renderHTML(qrcode)}</div>
                        <Form loading={isLoading} onSubmit={buyingHandler}>
                            <div className="form-group mb-2">
                                <label htmlFor="fullName">Full name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="fullName"
                                    id="fullName"
                                    value={fullName}
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <div className="form-group mb-2">
                                <label htmlFor="address">Address</label>
                                <textarea
                                    name="address"
                                    className="form-control"
                                    id="address"
                                    cols="30"
                                    rows="5"
                                    value={address}
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <div className="form-group mb-2">
                                <label htmlFor="tel">Telephone Number</label>
                                <input
                                    type="text"
                                    name="tel"
                                    className="form-control"
                                    value={tel}
                                    id="tel"
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <div className="form-group mb-2">
                                <label htmlFor="image">Slip image</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={dataChangeHandler}
                                />
                            </div>
                            <button className="btn btn-primary py-2 px-4" disabled={isLoading}>
                                {isLoading ? "Confirming" : "Confirm"}
                            </button>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderList;
