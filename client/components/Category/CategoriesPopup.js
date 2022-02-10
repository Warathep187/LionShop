import React from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { CATEGORIES_POPUP } from "../../queries/category";
import { Dimmer, Loader, Image, Segment, List } from "semantic-ui-react";

const CategoriesPopup = () => {
    const { loading, data, error } = useQuery(CATEGORIES_POPUP);

    if (error) {
        return <div className="p-3">{error.message}</div>;
    }

    return (
        <div className="p-3" style={{ width: "14rem" }}>
            {loading && (
                <div className="m-4 py-5 w-100 mx-auto text-center">
                    <Dimmer active inverted>
                        <Loader content="Loading" size="large" />
                    </Dimmer>
                    <Image src="/static/gif/loading.gif" />
                </div>
            )}
            {data && (
                <List>
                    {data.categories.map((category, index) => (
                        <List.Item className="my-1" key={category._id}>
                            <Link href={`/category/${category.category}`}>
                                <a className="fs-5">{category.category}</a>
                            </Link>
                        </List.Item>
                    ))}
                </List>
            )}
        </div>
    );
};

export default CategoriesPopup;
