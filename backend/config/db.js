import mongoose from "mongoose";

const connectDB = async() => {
    try {

        await mongoose.connect(process.env.MONGO_URL);
        console.log("Successfully Connected to MongoDB");
        
    } catch (error) {
        console.error(`Connection Error:${error.message}`);
            process.exit(1);
        
    }
}

export default connectDB;