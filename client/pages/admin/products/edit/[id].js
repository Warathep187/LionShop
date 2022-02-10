import { useQuery, useMutation } from "@apollo/client";
import { SINGLE_PRODUCT_FOR_EDIT } from "../../../../queries/admin";
import LoadingPage from "../../../../components/LoadingPage";
import { useRouter } from "next/router";
import EditProductForm from "../../../../components/Product/EditProductForm";

const EditProduct = () => {
    const router = useRouter();
    const { loading, data, error } = useQuery(SINGLE_PRODUCT_FOR_EDIT, {
        variables: {
            productId: router.query.id,
        },
    });

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div className="container">
            <p className="display-4 mb-1">Edit product</p>
            <hr />
            {data && <EditProductForm productData={data.singleProduct} />}
        </div>
    );
};

export default EditProduct;
