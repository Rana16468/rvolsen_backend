import { Schema, model,  Types } from "mongoose";
import { TUploadAudio, UploadAudioModel } from "./audiofile.interface";


const TUploadAudioSchema = new Schema<TUploadAudio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index:true
    },
    audioUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TUploadAudioSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TUploadAudioSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

TUploadAudioSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

// ✅ Static method
 TUploadAudioSchema.statics.isUploadCustomId = async function (
  id: string
): Promise<TUploadAudio | null> {
  return this.findById(id);
};


const uploaduudios= model<TUploadAudio, UploadAudioModel>(
  "uploaduudios",
  TUploadAudioSchema
);

export default uploaduudios;
