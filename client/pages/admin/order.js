import { useQuery, useMutation } from "@apollo/client";
import { ADMIN_GET_PAYMENTS } from "../../queries/admin";
import LoadingPage from "../../components/LoadingPage";
import AllOrder from "../../components/Payment/AllOrder";

const order = () => {
    const { loading, data, error } = useQuery(ADMIN_GET_PAYMENTS);

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div className="px-3">
            <p className="display-4 mb-1">
                Order
            </p>
            <hr />
            <AllOrder orders={data.adminGetPayments} />
        </div>
    );
};

export default order;
