import { useQuery } from "@apollo/client";
import { Rating } from "semantic-ui-react";
import { GET_PRODUCT_COMMENTS } from "../../queries/comment";
import { Dimmer, Image, Loader } from "semantic-ui-react";
import moment from "moment";

const Comments = ({ productId }) => {
    const { loading, data, error } = useQuery(GET_PRODUCT_COMMENTS, {
        variables: {
            productId,
        },
    });

    if (loading) {
        return (
            <div className="m-4 py-5 w-100 mx-auto text-center w-100">
                <Dimmer active inverted>
                    <Loader content="Loading" size="large" />
                </Dimmer>
                <Image src="/static/gif/loading.gif" />
            </div>
        );
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    return (
        <div className="container px-5 my-3 py-3">
            <p className="fs-4 fw-bold mb-1">Reviews</p>
            <hr />
            <div className="mx-3">
                {data.getProductComments.map((comment) => (
                    <div className="p-3 border border-1 rounded-2" key={comment._id}>
                        <div className="d-flex align-items-center">
                            <img
                                src={comment.user.profileImage.url}
                                alt="Profile Image"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                            <div className="ms-2">
                                <p className="fs-5 mb-1">{comment.user.username}</p>
                                <Rating
                                    icon="star"
                                    defaultRating={comment.rating}
                                    maxRating={5}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="my-2 mx-2">
                            <p>{comment.text}</p>
                        </div>
                        <span className="badge text-secondary">
                            {moment(comment.createdAt).fromNow()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;
