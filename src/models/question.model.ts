import mongoose, { type InferSchemaType, Schema } from "mongoose";

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 15,
    maxlength: 100,
  },
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
  tags: {
    type: [String],
    validate: {
      validator: (tags: string[]) => tags.length >= 1 && tags.length <= 5,
      message: "A question must have between 1 and 5 tags",
    },
  },
  votes: {
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  acceptedAnswer: {
    type: Schema.Types.ObjectId,
    ref: "Answer",
    default: null,
  },
  views: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  closedReason: { type: String },
  editHistory: [
    {
      editedBy: { type: Schema.Types.ObjectId, ref: "User" },
      editedAt: { type: Date, default: Date.now },
      previousBody: { type: String },
    },
  ],
});

questionSchema.index(
  { title: "text", body: "text" },
  { weights: { title: 10, body: 5 } },
);

const Question = mongoose.model("Question", questionSchema);
export type Iquestion = InferSchemaType<typeof questionSchema>;
export type QuestionDocument = mongoose.HydratedDocument<Iquestion>;

export { Question };
