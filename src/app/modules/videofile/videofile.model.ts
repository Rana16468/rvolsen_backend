import { model, Schema } from "mongoose";
import { TVideoFile, VideoFileModel } from "./videofile.interface";

const TVideoFileSchema = new Schema<TVideoFile, VideoFileModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    videoUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    like: {
      type: Number,
      default: 0,
    },
    dislike: {
      type: Number,
      default: 0,
    },
    share: {
      type: Number,
      default: 0,
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

TVideoFileSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TVideoFileSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

TVideoFileSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});


TVideoFileSchema .statics.isVideoFileCustomId = async function (
  id: string
): Promise<TVideoFile | null> {
  return this.findById(id);
};

const videofiles = model<TVideoFile, VideoFileModel>(
  "videofiles",
 TVideoFileSchema 
);
export default videofiles;