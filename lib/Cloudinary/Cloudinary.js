import cloudinary from 'cloudinary'
import { getBase64 } from './CloudinaryHelper.js'


const uploadFilesToCloudinary = async (files = []) => {
    // console.log(files);
    const uploadPromises = files.map(async (file) => {
        return new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload(file, {
                folder: "avatars",
                width: 150,
                crop: "scale"
            },
                (error, result) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve(result)
                }
            )
        })
    })
    // console.log(uploadPromises)

    try {
        const results = await Promise.all(uploadPromises)
        const formatedData = results.map((res) => ({
            public_id: res.public_id,
            url: res.secure_url,
        }))
        return formatedData;
    } catch (error) {
        throw new Error("Error Uploading Files to cloudinary", error)
    }
}


export default uploadFilesToCloudinary