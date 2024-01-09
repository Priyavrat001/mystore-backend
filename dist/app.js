import express from 'express';
// importing all routes
import userRoute from "./routes/user.js";
import connectToMongo from "./utils/DataBase.js";
import { errorMiddleware } from './middlewares/error.js';
const port = 4000;
const app = express();
connectToMongo();
// using the middleware express.json
app.use(express.json());
// testing
app.get("/", (req, res) => {
    res.send("api is working just fine.");
});
// using routes
app.use("/api/v1", userRoute);
// error handling middleware
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`server is working on port http://localhost${port}`);
});
