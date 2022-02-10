import { useQuery } from "@apollo/client";
import { GET_PAYMENTS } from "../queries/payment";
import LoadingPage from "../components/LoadingPage";
import AllUserOrder from "../components/Payment/AllUserOrder";

const payment = () => {
    const {loading, data, error} = useQuery(GET_PAYMENTS);

    if(loading) {
        return <LoadingPage />
    }

    if(error) {
        return <p>{error.message}</p>
    }

    return <div className="px-5">
        <p className="display-4 mb-1">Payments</p>
        <hr />
        <div>
            <AllUserOrder orders={data.getPayments} />
        </div>
    </div>;
};

export default payment;
