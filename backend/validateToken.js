import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {
    // console.log(req.cookies);
    if (!req.cookies || !req.cookies.access_token) {
        res.status(301).redirect("/");
        return;
    }
    const token = req.cookies.access_token;
    // console.log(token);
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (error, decoded) => {
        if (error){
            res.status(401).json({message: "Authorization failed."});
            return;
        }
        if (req.path == "/api/logout" || req.path == "/api/active") {
            next();
        }
        else {
            next(decoded);
        }
    });
};

export default validateToken;