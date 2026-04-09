import { Schema, model, Document } from "mongoose";

export interface ITag extends Document {
  name: string;
  description: string;
  usageCount: number;
  createdBy: Schema.Types.ObjectId;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 35,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

TagSchema.index({ usageCount: -1 });
TagSchema.index({ name: "text", description: "text" });

export const Tag = model<ITag>("Tag", TagSchema);
