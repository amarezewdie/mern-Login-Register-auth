import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: String,
  roles: {
    user: {
      type: Number,
      default: 2001,
    },
    editor: Number,
    admin: Number,
  },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
