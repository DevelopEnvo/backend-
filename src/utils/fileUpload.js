//cloudinary file uploading steps

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (localFilePath) return null;
//         //upload the file to the cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type:"auto"
//         })
//         //file has been sucessfullay uploaded
//         console.log("file is uploaded successfully on cloudinary", response.url);
//         return response;
//     }
//     catch(error){
//         fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
//         return null; 
//     }
// }
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // Check if localFilePath exists
        // Upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // File has been successfully uploaded
        console.log("File is uploaded successfully on Cloudinary:", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation failed
        return null; 
    }
}

export{ uploadOnCloudinary };









// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });