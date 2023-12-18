import mongoose from "mongoose";

type Error = {
  message: string;
};

const connectDatabase = async (database: string) => {
  try {
    const conn = await mongoose.connect(
      (process.env.MONGODB_URI as string) + database
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDatabase;
