import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: null,
  },
  bannedAt: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);
export type Iuser = InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.HydratedDocument<Iuser>;

export { User };
