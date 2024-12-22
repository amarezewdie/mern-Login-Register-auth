import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONO_URL);
    console.log("db connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export default connectDb;
