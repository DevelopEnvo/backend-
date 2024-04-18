import app from '../app.js';
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/fileUpload.js";
import {ApiResponse} from '../utils/apiResponse.js';

const generateAccessAndRefreshToken = async(UserId) => {
    //user ko find kr lega then accesstoken and refreshtoken bhi generate kr lega
    try {
        const user = await User.findById(UserId)
        console.log("user found:", user);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
//refreshtokenn ko database mein save karva diya
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})
//acesstoken and referesh token bhi generate ho gaya
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        console.log("error in generateAccessAndRefreshToken function: ", error);
        throw new ApiError(500,"Something went wrong while generationg access and refresh token");
    }
}


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


    const avatarLocalPath = req.files?.avatar?.[0]?.path;
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

const loginUser = asyncHandler(async(req,res) => {
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password} = req.body
    console.log(email);



    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }
    // if(!username || !email){
    //    throw new ApiError(400, "username or email is required")
    //}
    const user = await User.findOne({
        $or :[{username}, {email}],
    });
    console.log("found user:",user)
    
    if(!user){
        throw new ApiError(404, "user does not exists")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credentials")
    }
    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken, refreshToken
            },
            "user logged in successfully"
        )
    )

})
const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 //undefined --> this removes the file from the document
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

export { 
    registerUser,
    loginUser,
    logoutUser,
}