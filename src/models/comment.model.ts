import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  body: string;
  author: Types.ObjectId;
  targetType: "Question" | "Answer"; // polymorphic — works for both
  targetId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Question", "Answer"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
  },
  { timestamps: true },
);

CommentSchema.index({ targetId: 1, targetType: 1 });
CommentSchema.index({ author: 1 });

export const Comment = model<IComment>("Comment", CommentSchema);
