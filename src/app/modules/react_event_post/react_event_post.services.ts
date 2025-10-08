import mongoose, { Types } from "mongoose";
import { TReactDisLike, TReactLike } from "./react_event_post.interface";
import videofiles from "../videofile/videofile.model";
import AppError from "../../errors/AppError";
import status from "http-status";
import { reactdislikes, reactlikes } from "./react_event_post.model";

const recordedReactEventPostIntoDb = async (
  payload: TReactLike,
  userId: string
) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // ✅ Check if video exists
      const eventPost = await videofiles.findById(payload.videofileId).session(session);
      if (!eventPost) {
        throw new AppError(status.NOT_FOUND, "Video file not found", "");
      }

      // ✅ Check if user already reacted
      const existingReact = await reactlikes.findOne({
        videofileId: payload.videofileId,
        userId: new Types.ObjectId(userId),
        isDelete: false,
      }).session(session);

      if (existingReact) {
        // ✅ Remove like (toggle off)
        await  reactlikes.findByIdAndDelete(existingReact._id, { session });
        await videofiles.findByIdAndUpdate(
          payload.videofileId,
          { $inc: { like: -1 } },
          { session }
        );
      } else {
        // ✅ Add new like (toggle on)
        await  reactlikes.create(
          [
            {
              videofileId: payload.videofileId,
              userId: new Types.ObjectId(userId),
              isLike: true,
              isDelete: false,
            },
          ],
          { session }
        );

        await videofiles.findByIdAndUpdate(
          payload.videofileId,
          { $inc: { like: 1 } },
          { session }
        );
      }
    });

    return {
      success: true,
      message: "Reaction recorded successfully",
    };
  } catch (error: any) {
    throw new AppError(
      status.SERVICE_UNAVAILABLE,
      "Service unavailable",
      error
    );
  } finally {
    session.endSession();
  }
};

const disLikeReactEventPostIntoDb = async (
  payload: TReactDisLike,
  userId: string
) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const eventPost = await videofiles
        .findById(payload.videofileId)
        .session(session);

      if (!eventPost) {
        throw new AppError(status.NOT_FOUND, "Video file not found", "");
      }
      const userObjectId = new Types.ObjectId(userId);
      const existingDislike = await reactdislikes
        .findOne({
          videofileId: payload.videofileId,
          userId: userObjectId,
          isDelete: false,
        })
        .session(session);

      // ✅ Check if user already liked — if yes, remove like first
      const existingLike = await reactlikes
        .findOne({
          videofileId: payload.videofileId,
          userId: userObjectId,
          isDelete: false,
        })
        .session(session);

      if (existingLike) {
        await reactlikes.findByIdAndDelete(existingLike._id, { session });
        await videofiles.findByIdAndUpdate(
          payload.videofileId,
          { $inc: { like: -1 } },
          { session }
        );
      }

      if (existingDislike) {
        // ✅ Toggle off dislike (remove it)
        await reactdislikes.findByIdAndDelete(existingDislike._id, { session });
        await videofiles.findByIdAndUpdate(
          payload.videofileId,
          { $inc: { dislike: -1 } },
          { session }
        );
      } else {
        await reactdislikes.create(
          [
            {
              videofileId: payload.videofileId,
              userId: userObjectId,
              dislike: true,
              isDelete: false,
            },
          ],
          { session }
        );

        await videofiles.findByIdAndUpdate(
          payload.videofileId,
          { $inc: { dislike: 1 } },
          { session }
        );
      }
    });

    return {
      success: true,
      message: "Dislike reaction recorded successfully",
    };
  } catch (error: any) {
    throw new AppError(
      status.SERVICE_UNAVAILABLE,
      "Service unavailable",
      error
    );
  } finally {
    session.endSession();
  }
};
const ReactEventPostServices = {
  recordedReactEventPostIntoDb,
  disLikeReactEventPostIntoDb
};

export default ReactEventPostServices;
