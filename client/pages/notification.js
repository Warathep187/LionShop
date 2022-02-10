import { useQuery } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../queries/notification";
import LoadingPage from "../components/LoadingPage";
import Confirm from "../components/Notification/Confirm";
import Cancel from "../components/Notification/Cancel";

const notification = () => {
    const { loading, data, error } = useQuery(GET_NOTIFICATIONS);

    if (loading) {
        return <LoadingPage />;
    }

    if (error) {
        return <p>{error.message}</p>;
    }

    console.log(data);

    return (
        <>
            <div className="container px-5">
                <p className="display-4 mb-1">Notifications</p>
                <hr />
                <div>
                    {data.getNotifications.map((notification) => {{
                        if(notification.type === "confirm") {
                            return <Confirm notification={notification} key={notification._id} />
                        }else if(notification.type === "cancel") {
                            return <Cancel notification={notification} key={notification._id} />
                        }
                    }})}
                </div>
            </div>
        </>
    );
};

export default notification;
