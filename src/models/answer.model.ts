import mongoose, { type InferSchemaType, Schema } from "mongoose";

const answerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    minlength: 15,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  votes: {
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
});

const Answer = mongoose.model("Answer", answerSchema);
export type Ianswer = InferSchemaType<typeof answerSchema>;
export type AnswerDocument = mongoose.HydratedDocument<Ianswer>;

export { Answer };
