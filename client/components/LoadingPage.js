import React from "react";

const LoadingPage = () => {
    return (
        <div className="container-fluid bg-gray">
            <div className="mx-auto" style={{position: "absolute", left: "50%", top: "50%", transition: "translate(-50%, -50%)"}}>
                <div className="spinner-grow text-success" role="status" style={{width: "2rem", height: "2rem"}}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-danger mx-3" role="status" style={{width: "2rem", height: "2rem"}}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-warning" role="status" style={{width: "2rem", height: "2rem"}}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;
