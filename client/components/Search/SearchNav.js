import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { PRODUCT_SEARCHBAR } from "../../queries/product";
import { useRouter } from "next/router";

const SearchNav = () => {
    const router = useRouter();
    const [key, setKey] = useState("");
    const [getProducts, { loading, data, error }] = useLazyQuery(PRODUCT_SEARCHBAR);

    const typingHandler = (e) => {
        if (e.target.value.trim() !== "") {
            setKey(e.target.value.trim());
            getProducts({
                variables: {
                    key: e.target.value,
                },
            });
        } else {
            setKey("");
        }
    };

    const searchHandler = (e) => {
        e.preventDefault();
        if (key.trim() !== "") {
            router.push(`/search?key=${key}`);
        }
    };

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div>
            <form onSubmit={searchHandler}>
                <input
                    className="form-control rounded-pill"
                    list="datalistOptions"
                    placeholder="Type to search..."
                    onChange={typingHandler}
                    value={key}
                    style={{width: "25rem"}}
                />
            </form>
            <datalist id="datalistOptions">
                {loading && (
                    <option value={null} disabled>
                        Loading..
                    </option>
                )}
                {data && data.search.map((item) => <option value={item.name} key={item._id}>{item.name}</option>)}
            </datalist>
        </div>
    );
};

export default SearchNav;
