import mongoose from "mongoose";

import httpStatus, { status } from "http-status";
import users from "../user/user.model";
import { USER_ACCESSIBILITY } from "../user/user.constant";
import AppError from "../../errors/AppError";
import { jwtHelpers } from "../../helper/jwtHelpers";
import config from "../../config";
import { ProfileUpdateResponse, RequestWithFile } from "./auth.interface";
import QueryBuilder from "../../builder/QueryBuilder";
import { user_search_filed } from "./auth.constant";
import { TUser } from "../user/user.interface";

import uploaduudios from "../audiofile/audiofile.model";

import { uploadToS3 } from "../../utils/uploadToS3";
import { deleteFromS3 } from "../../utils/deleteFromS3";
import fs from "fs/promises";
import path from "path";
import videofiles from "../videofile/videofile.model";
import { reactdislikes, reactlikes, sharereacts } from "../react_event_post/react_event_post.model";


const loginUserIntoDb = async (payload: {
  email: string;
  password: string;
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isUserExist = await users.findOne(
      {
        $and: [
          { email: payload.email },
          { isVerify: true },
          { status: USER_ACCESSIBILITY.isProgress },
          { isDelete: false },
        ],
      },
      { password: 1, _id: 1, isVerify: 1, email: 1, role: 1 },
      { session }
    ).lean();

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }

    if (
      !(await users.isPasswordMatched(payload?.password, isUserExist.password))
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "This Password Not Matched", "");
    }

    const jwtPayload:{
        id:any, role:string, email:string
    }= {
      id: isUserExist._id,
      role: isUserExist.role,
      email: isUserExist.email,
    };
      

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (isUserExist.isVerify) {
      accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.expires_in as string
      );

      refreshToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.refresh_expires_in as string
      );
    }
    await session.commitTransaction();

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const refreshTokenIntoDb = async (token: string) => {
  try {

    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt_refresh_secret as string
    );

    const { id } = decoded;

    console.log('id',id)

    const isUserExist = await users.findOne(
      {
        $and: [
          { _id: id },
          { isVerify: true },
          { status: USER_ACCESSIBILITY.isProgress },
          { isDelete: false },
        ],
      },
      { _id: 1, isVerify: 1, email: 1 }
    );

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }
    let accessToken: string | null = null;
    if (isUserExist.isVerify) {
      const jwtPayload = {
        id: isUserExist.id,
        role: isUserExist.role,
        email: isUserExist.email,
      };
      accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.expires_in as string
      );
    }

    return {
      accessToken,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "refresh Token generator error",
      error
    );
  }
};

const myprofileIntoDb = async (id: string) => {
  try {
    return await users
      .findById(id)
      .select("name email phoneNumber dateOfBirth photo location");
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "issues by the get my profile section server  error",
      error
    );
  }
};

/**
 * @param req
 * @param id
 * @returns
 */
const changeMyProfileIntoDb = async (
  req: RequestWithFile,
  id: string
): Promise<ProfileUpdateResponse> => {
  try {
    const file = req.file;
    const { name, phoneNumber, location} = req.body as {
      name?: string;
      location?: string;
      phoneNumber?: string;
   
    };

    const updateData: {
      name?: string;
      photo?: string;
       location?: string;
      phoneNumber?: string;
    } = {};

    if (name) {
      updateData.name = name;
    }
    if (location) {
      updateData.location = location;
    }
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }
  
    if (file) {
      // updateData.photo = file?.path?.replace(/\\/g, "/");
      updateData.photo = await uploadToS3(file, config.file_path);
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No data provided for update",
        ""
      );
    }

    const result = await users.findByIdAndUpdate(
      id,
      { $set: { ...updateData } },
      {
        new: true,
        upsert: true,
      }
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    };

    return {
      status: true,
      message: "Successfully updated profile",
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Profile update failed",
      error.message
    );
  }
};

const findByAllUsersAdminIntoDb = async (query: Record<string, unknown>) => {
  try {
    const allUsersdQuery = new QueryBuilder(
      users.find({ isVerify: true, isDelete: false }).select("-isDelete -createdAt -updatedAt -verificationCode").lean(),
      query
    )
      .search(user_search_filed)
      .filter()
      .sort()
      .paginate()
      .fields();

    const all_users = await allUsersdQuery.modelQuery;
    const meta = await allUsersdQuery.countTotal();

    return { meta, all_users };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "find By All User Admin IntoDb server unavailable",
      error
    );
  }
};

const deleteLocalFile = async (filePath?: string) => {
  if (!filePath) return;
  try {
    const localPath = path.resolve(filePath);
    await fs.access(localPath);
    await fs.unlink(localPath);
  } catch {
    // ignore if not exists
  }
};

const deleteAccountIntoDb = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await users.findOne(
      {
        _id: userId,
        isDelete: false,
        isVerify: true,
        status: USER_ACCESSIBILITY.isProgress,
      },
      null,
      { session }
    ).lean();

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    /* ---------- Collect file paths BEFORE delete ---------- */
    const audios = await uploaduudios
      .find({ userId })
      .select("audioUrl")
      .lean();

    const videos = await videofiles
      .find({ userId })
      .select("videoUrl")
      .lean();

    const userPhoto = user.photo as any;

    /* ---------- DB DELETE (TRANSACTION SAFE) ---------- */
    await Promise.all([
      reactlikes.deleteMany({ userId }, { session }),
      reactdislikes.deleteMany({ userId }, { session }),
      sharereacts.deleteMany({ userId }, { session }),
      uploaduudios.deleteMany({ userId }, { session }),
      videofiles.deleteMany({ userId }, { session }),
      users.deleteOne({ _id: userId }, { session }),
    ]);

    /* ---------- COMMIT DB ---------- */
    await session.commitTransaction();
    session.endSession();

    /* ---------- FILE DELETE (POST-COMMIT) ---------- */
    await Promise.all([
      ...audios.map(a => deleteFromS3(a.audioUrl)),
      ...videos.map(v => deleteFromS3(v.videoUrl)),
      deleteFromS3(userPhoto),
    ]);

    await Promise.all([
      ...audios.map(a => deleteLocalFile(a.audioUrl)),
      ...videos.map(v => deleteLocalFile(v.videoUrl)),
      deleteLocalFile(userPhoto),
    ]);

    return {
      success: true,
      message: "Account deleted successfully (transaction-safe)",
    };
  } catch (error:any) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Account deletion failed, transaction rolled back",
      error
    );
  }
};

const isBlockAccountIntoDb = async (
  id: string,
  payload: Partial<TUser>
) => {
 
  try {
    // Update user status
    const result = await users.findByIdAndUpdate(
      id,
      { status: payload.status },
      { new: true } 
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return {
      success: true,
      message: `User successfully ${payload.status}`,
  
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Block account operation failed",
      error
    );
  }
};






const AuthServices = {
  loginUserIntoDb,
  refreshTokenIntoDb,
  myprofileIntoDb,
  changeMyProfileIntoDb,
  findByAllUsersAdminIntoDb,
  deleteAccountIntoDb,
  isBlockAccountIntoDb

};

export default AuthServices;
