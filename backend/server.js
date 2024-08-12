import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {dirname, join} from "path";
import {fileURLToPath} from "url";
import {registerUser, loginUser} from "./userControllers.js";
import connectDB from "./connectDB.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// making frontend directory static
const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDir = join(__dirname, "../frontend");
app.use(express.static(frontendDir));


// routes
app.get("/", (req,res) => {
    res.status(200).sendFile("intro_page.html", {root: frontendDir})
});
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}.`)
    })
})
.catch((error) => {
    console.log(error)
});
