import bcrypt from "bcrypt";

const hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }
    catch(error) {
        console.log(error);
        throw error;
    }
}

const verifyPassword = async (inputPassword, storedHash) => {
    try {
        const verified = await bcrypt.compare(inputPassword, storedHash);
        return verified;
    }
    catch(error) {
        console.log(error);
        throw error;
    }
};

export {hashPassword, verifyPassword};