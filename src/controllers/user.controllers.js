import app from '../app.js';
import {asyncHandler} from '../utils/asynHandler.js';

const registerUser = asyncHandler(async(req,res) =>{
    res.status(200).json({
        message: "hey raj",
    })
})

export {registerUser}