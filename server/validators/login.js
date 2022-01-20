module.exports = ({email, password}) => {
    try {
        if(!email || email.trim() === "") {
            throw new Error("Email must be provided");
        }else if(!password || password.trim() === "") {
            throw new Error("Password must be provided");
        }else if(password.trim().length < 6) {
            throw new Error("Password must be at least 6 characters")
        }
    }catch(e) {
        throw new Error(e.message);
    }
}