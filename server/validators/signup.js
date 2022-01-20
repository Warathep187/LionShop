module.exports = ({email, password, confirm}) => {
    try {
        if(!email || email.trim() === "") {
            throw new Error("Email must be provided")
        }else if(!password || password.trim() === "") {
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