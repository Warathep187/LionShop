import Nav from '../components/Navs/Nav';
import {useQuery} from "@apollo/client";
import {RECOMMENDED_PRODUCTS} from "../queries/product";
import LoadingPage from '../components/LoadingPage';
import RecommendedProducts from '../components/Product/RecommendedProducts';
import NewsProducts from '../components/Product/NewsProducts';
import AllProducts from "../components/Product/AllProducts"

const Home = () => {
    const {loading, data, error} = useQuery(RECOMMENDED_PRODUCTS);

    if(loading) {
        return <LoadingPage />
    }   

    if(error) {
        return <p>{error.message}</p>
    }

    return <>
        <div className="container">
            <div>
                <p className="fs-1 fw-bold mb-0">Recommended</p>
                <RecommendedProducts products={data.recommendedProducts} />
            </div>
            <hr />
            <div>
                <p className="fs-1 fw-bold mb-0">New!!</p>
                <NewsProducts />
            </div>
            <hr />
            <div>
                <p className="fs-1 fw-bold mb-0">All</p>
                <AllProducts />
            </div>
            <hr />
        </div>
    </>;
}

export default Home;