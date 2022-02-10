const loginValidator = ({email, password}) => {
    try {
        if(!email || email.trim() === "") {
            throw new Error("Email must be provided");
        }else if(!email.match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)) {
            throw new Error("Email is invalid")
        }else if(!password || password.trim() === "") {
            throw new Error("Password must be provided");
        }else if(password.trim().length < 6) {
            throw new Error("Password must be at least 6 characters")
        }
    }catch(e) {
        throw new Error(e.message);
    }
}

const signupValidator = ({email, password, confirm}) => {
    try {
        if(!email || email.trim() === "") {
            throw new Error("Email must be provided")
        }else if(!email.match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)) {
            throw new Error("Email is invalid")
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

const sendOTPValidator = (email) => {
    try {
        if(!email.match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)) {
            throw new Error("Email is invalid")
        }
    }catch(e) {
        throw new Error(e.message);
    }
}

const resetPasswordValidator = ({email, password, confirm, otp}) => {
    try {
        if(!email || email.trim() === "") {
            throw new Error("Email must be provided")
        }else if(!email.match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)) {
            throw new Error("Email is invalid")
        }else if(!password || password.trim() === "") {
            throw new Error("Password must be provided")
        }else if(password.trim().length < 6) {
            throw new Error("Password must be at least 6 characters")
        }else if(password !== confirm) {
            throw new Error("Password does not match.")
        }else if(otp.length !== 6 || isNaN(parseInt(otp))) {
            throw new Error("OTP is invalid format")
        } 
    }catch(e) {
        throw new Error(e.message);
    }
}

module.exports = {loginValidator, signupValidator, sendOTPValidator, resetPasswordValidator};