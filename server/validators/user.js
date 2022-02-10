const updateProfileValidator = ({username, image}) => {
    try {
        const pureImageBase64 = image.replace(/^data:image\/\w+;base64,/, "");
        if (!username || username.trim() === "") {
            throw new Error("Username must be provided");
        } else if (username.trim().length < 4) {
            throw new Error("Username must be at least 4 characters");
        } else if (image && !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
            pureImageBase64
        )) {
            throw new Error("Image is invalid format. Please try again");
        }
    }catch(e) {
        throw new Error(e.message);
    }
}

const changePasswordValidator = ({password, confirm}) => {
    try {
        if(!password || password.trim() === "") {
            throw new Error("Password must be provided")
        }else if(password.trim().length < 6) {
            throw new Error("Password must be at least 6 characters")
        }else if(password !== confirm) {
            throw new Error("Password does not match.")
        }
    }catch(e) {
        throw new Error(e.message);
    }
}

module.exports = {updateProfileValidator, changePasswordValidator};