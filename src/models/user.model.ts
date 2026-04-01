import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
export type Iuser = InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.HydratedDocument<Iuser>;

export { User };
