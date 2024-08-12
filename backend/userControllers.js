import users from "./users.js";
import { hashPassword, verifyPassword } from "./passwordMiddlewares.js";
import {generate} from "generate-password";

const registerUser = async (req, res) => {
    try {
      const user_arr = req.body;
      console.log(user_arr);
      
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
        console.log(name, password);
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
    res.status(200).json({message: "Logged in successfully."});
  }
  catch(error) {
    console.log(error);
    res.status(500).json({message: "Internal server error."});
  }
}

export {registerUser, loginUser};