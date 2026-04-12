import { asyncHandler } from "../utils/asyncHandler.js";
import {apiErrors} from "../utils/apiErrors.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { create } from "node:domain";
import {apiResponse} from "../utils/apiResponse.js"
import { devNull } from "node:os";

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken =user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new apiErrors(500, "something went wrong while generating access and refresh token")
    }
}



const registerUser =  asyncHandler(async(req, res)=>{
    // res.status(200).json({
    //     message: "working fine"
    // })

    // get user details
    // validation -- not empty
    // check if user already exists -- using username and email
    // check if user sends files -- avatar 
    // upload them to cloudinary , avatar
    // create user object --create entry in db
    // remove password and refesh token field from response
    // check for user creation
    // return response  

    //getting user details
    const {fullName, email, userName, password} = req.body
    console.log(email)

    // validation
    if(
        [fullName, email, userName, password].some((field)=>(field?.trim() === ""))
    ){
        throw new apiErrors(400, "all fields are required")
    }

    // checking if user already exists by using email
    const existedUser = await User.findOne({
        $or: [{email}, {userName}]
    })
    if(existedUser){
        throw new apiErrors(409, "user already exists")
    }

    // checking for images
    const avatarLocalPath = req.files?.avatar?.[0]?.path 
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){
        throw new apiErrors(400, "avatar file is required")
    }

    // upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiErrors(400, "avatar file is required")
    }

    // create user 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    const createdUser = await user.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new apiErrors(500, "something went wrong when registering user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "user registered successfully")
    )


})


const loginUser = asyncHandler(async(req, res)=>{
    // req.body => data
    // username or email validationn
    // find the user
    // access and refresh token
    // send cookies

    const {email, userName, password} = req.body
    
    // username ya email , kisi se bhi login ho jayega
    if(!userName || !email){
        throw new apiErrors(400, "username or password is required")
    }

    //ya to username , ya to email dhund do
    const user = await User.findOne({
        $or: [{userName}, {email}]
    })

    if(!user){
        throw new apiErrors(404, "user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiErrors(401, "password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // setting up cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "user loggedin successfully"
        )
    )





})

const logOut = asyncHandler(asyc(req, res)=>{
    User.find
})
export {registerUser, loginUser }