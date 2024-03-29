import express from "express";
import cors from "cors";
import cookieParser  from "cookie-parser";



const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({limit:"16kb"}))// used to save the json files that comes from the server
app.use(express.urlencoded({extended:true, limit:"16kb"}))//used to saver the url data 
app.use(express.static("public"))//used to save the files videos images to the public folder

app.use(cookieParser())



//routes import
import userRouter from './routes/user.routes.js'

//routes declarations
app.use("/api/v1/users",userRouter)

// https://localhost:8080/api/v1/users/register

export default app;