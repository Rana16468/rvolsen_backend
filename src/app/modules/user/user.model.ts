import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";
import { socialAuth, USER_ACCESSIBILITY, USER_ROLE } from "./user.constant";
import { TUser, UserModel } from "./user.interface";
import config from "../../config";

const TUserSchema = new Schema<TUser, UserModel>(
  {
    name: { type: String, required: [true, "user name is Required"] },
    password: { type: String, required: [false, "Password is Required"] },

    email: {
      type: String,
      required: [true, "Email is Required"],
      trim: true,
      unique: true,
      index:true
    },
    phoneNumber: {
      type: String,
      required: [false, "phone number is required"],
      default:null
    },
   
    verificationCode: {
      type: Number,
      required: [false, "verification Code is Required"],
      index:true
    },
    isVerify: {
      type: Boolean,
      required: [false, "isVartify is not required"],
      index:true,
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: [
          USER_ROLE.admin,
          USER_ROLE.user,
          USER_ROLE.superAdmin,
        ],
        message: "{VALUE} is Not Required",
      },
      required: [true, "Role is Required"],
      index:true,
      default: USER_ROLE.user,
    },
    provider: {
      type: String,
      enum: {
        values: [socialAuth.googleAuth, socialAuth.appleAuth],
      },
      required: [false, "provider is Required"],
      default:null
    },
    status: {
      type: String,
      enum: {
        values: [USER_ACCESSIBILITY.isProgress, USER_ACCESSIBILITY.blocked],
        message: "{VALUE} is not required",
      },
      required: [true, "Status is Required"],
      default: USER_ACCESSIBILITY.isProgress as any,
    },

    photo: {
      type: String,
      required: [false, "photo is not required"],
      default: null,
    },
    location: {
      type: String,
      required: [false, "address is not required"],
      default:null
    },
    isDelete: {
      type: Boolean,
      required: [true, "isDeleted is Required"],
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

TUserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret.password;
    return ret;
  },
});

// mongoose middleware
TUserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  next();
});

TUserSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

TUserSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TUserSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

TUserSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

TUserSchema.statics.isUserExistByCustomId = async function (id: string) {
  return await users.findOne({ id });
};

TUserSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string
) {
  const password = await bcrypt.compare(plainTextPassword, hashPassword);
  return password;
};

TUserSchema.statics.isJWTIssuesBeforePasswordChange = async function (
  passwordChangeTimestamp: Date,
  jwtIssuesTime: number
) {
  const passwordChangeTime = new Date(passwordChangeTimestamp).getTime() / 1000;
  return passwordChangeTime > jwtIssuesTime;
};

const users = model<TUser, UserModel>("users", TUserSchema);

export default users;
