import mongoose from "mongoose";
export const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    requird: [true, "please provide a unique name"],
    unique: [true, "user already exist"],
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "please provide a email"],
    unique: true,
  },
  mobile: { type: Number },
  adress: { type: String },
  profile: { type: String },
  firstName: { type: String },
  lastName: { type: String },
});
export default mongoose.model.Users || mongoose.model("User", UserSchema);
