import app from '../app.js';
import {asyncHandler} from "../utils/asynHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/fileUpload.js";
import {ApiResponse} from '../utils/apiResponse.js';




const registerUser = asyncHandler(async(req,res) =>{
    //getyser details from frontend
    //validation not empty
    //check if user already exists username ,email
    //check for images,check for avatar
    //uploaf them to cloudinary ,avatar
    //create user objects-create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response
    const{fullName,email,password,username} = req.body;
    console.log("email:", email);

    // if(fullname === ""){
    //     throw new ApiError()
    // }
    if(
        [fullName,email,password,username].some((field) => field?.trim() === "")

    ){
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with username or email already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)  && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username:username.toLowerCase(),
        password,
    })
    const createdUser = await User.findById(user.id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser, "user registered succesfully")
    )

})

export { registerUser}