import users from "./users.js";
import { hashPassword, verifyPassword } from "./passwordMiddlewares.js";
import validateToken from "./validateToken.js";
import jwt from "jsonwebtoken";
import {generate} from "generate-password";

const registerUser = async (req, res) => {
    try {
      const user_arr = req.body;
      // console.log(user_arr);
      
      for (let i=0; i<user_arr.length; i++) {
        const user = await users.findOne({email_id: user_arr[i]["email_id"]})
        if (user) {
          res.status(400).json({message: "User already exists."});
          return;
        }
        const password = generate({
          length: 10,
          numbers: true,
          strict: true
        })
        const name = user_arr[i]["name"];
        console.log(name, " - ", password);
        const hashedPassword = await hashPassword(password);
        user_arr[i]["hashedPassword"] = hashedPassword;
      }

      await users.insertMany(user_arr);

      res.status(201).json({message: 'Users registered successfully.'});
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
};
  

const loginUser = async (req, res) => {
  try {
    const {username, password} = req.body;
    const user = await users.findOne({email_id: username}).select({hashedPassword: 1});
    if (!user) {
      res.status(404).json({message: "Invalid username."});
      return;
    }
    const check = await verifyPassword(password, user.hashedPassword);
    if (!check) {
      res.status(400).json({message: "Incorrect password."});
      return;
    }
    const accessToken = jwt.sign({
        user: {
            email_id: username,
            id: user._id
        }
    }, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: process.env.JWT_TOKEN_EXPIRY_TIME // increase expiration time for JWT token in production
    });
    res.cookie("access_token", accessToken, {
        // httpOnly: true,
        // secure: true,
        sameSite: "strict",
        maxAge: process.env.AUTHENTICATION_COOKIE_EXPIRY_TIME // increase expiration time of cookie in production
    }); // enable the httpOnly and secure flags in production
    res.status(200).json({message: "Logged in successfully."});
  }
  catch(error) {
    console.log(error);
    res.status(500).json({message: "Internal server error."});
  }
}

const logoutUser = (req,res) => {
  validateToken(req, res, () => {
      try {
          res.clearCookie("access_token");
          res.status(301).redirect("/");
      }
      catch (error) {
          console.log(error);
      }
  })
};

const activeSession = (req, res) => {
  validateToken(req, res, () => {
    res.status(200).json({message: "Session active."});
  })
}

const changePassword = (req,res) => {
  validateToken(req, res, async (decoded) => {
    try {
      const {oldPassword, newPassword} = req.body;
      const email_id = decoded.user.email_id;
      const user = await users.findOne({email_id: email_id}).select({hashedPassword: 1});
      if (!user) {
        res.status(404).json({message: "User not found."});
        return;
      }
      const verify = verifyPassword(oldPassword, user.hashedPassword);
      if (!verify) {
        res.status(404).json({message: "Incorrect old password."});
        return;
      }
      const newHashedPassword = await hashPassword(newPassword);
      await users.findOneAndUpdate({email_id}, {hashedPassword: newHashedPassword}, {new: true});
      console.log("Old - " + oldPassword)
      console.log("New - " + newPassword)
      res.status(200).json({message: "Password updated. Logging out"})
    }
    catch(error) {
      console.log(error);
      res.status(500).json({message: "Internal server error."});
    }
  })
}

export {registerUser, loginUser, logoutUser, activeSession, changePassword};