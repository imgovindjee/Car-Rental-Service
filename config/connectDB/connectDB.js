import mongoose from "mongoose";



const connectDB = async () => {

    // getting the URI STRING FROM ".env" file
    const URI = process.env.MONGO_DB_CONNECTION_STRING;

    await mongoose
        .connect(URI)
        .then((data) => console.log(`Connected to Database: ${data.connection.host}`))
        .catch((error) => {
            console.log("Error connecting to the Database")
            throw error;
        })
}


export default connectDB