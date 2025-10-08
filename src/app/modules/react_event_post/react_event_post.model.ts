import { Schema, model } from "mongoose";
import { DisLikeReactEventPostModel, ReactEventPostModel, ShareReactEventPostModel, TReactDisLike, TReactLike, TShareReact } from "./react_event_post.interface";


const TReactLikeSchema = new Schema<TReactLike, ReactEventPostModel>(
  {
    videofileId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "videofiles",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    isLike: {
      type: Boolean,
      default: false,
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

TReactLikeSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TReactLikeSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

TReactLikeSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

// 3️⃣ Static Method
TReactLikeSchema.statics.isReactEventPostCustomId = async function (
  id: string
): Promise<TReactLike | null> {
  return this.findById(id);
};

// 4️⃣ Create Model
export const reactlikes = model<TReactLike, ReactEventPostModel>(
  "reactlikes",
  TReactLikeSchema
);

// started dislike section 

// 1️⃣ Define the Schema


const TReactDisLikeSchema = new Schema<TReactDisLike, DisLikeReactEventPostModel>(
  {
    videofileId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "videofiles",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    dislike: {
      type: Boolean,
      default: false,
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


TReactDisLikeSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TReactDisLikeSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

TReactDisLikeSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

TReactDisLikeSchema.statics.isDisLikeReactEventPostCustomId = async function (
  id: string
): Promise<TReactDisLike | null> {
  return this.findById(id);
};

export const reactdislikes = model<TReactDisLike, DisLikeReactEventPostModel>(
  "reactdislikes",
  TReactDisLikeSchema
);





const TShareReactSchema = new Schema<TShareReact, ShareReactEventPostModel>(
  {
    videofileId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "videofiles",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
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


TShareReactSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TShareReactSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

TShareReactSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});


TShareReactSchema.statics.isTShareReactEventPostCustomId = async function (
  id: string
): Promise<TShareReact | null> {
  return this.findById(id);
};


export const sharereacts= model<TShareReact, ShareReactEventPostModel>(
  "sharereacts",
  TShareReactSchema
);



