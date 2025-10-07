
import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import upload from "../../utils/uploadFile";
import { USER_ROLE } from "../user/user.constant";
import AppError from "../../errors/AppError";
import validationRequest from "../../middlewares/validationRequest";
import status from "http-status";
import audioValidationSchema from "./audiofile.validation";
import AudioFileController from "./audiofile.controller";


const route = express.Router();
route.post(
  "/upload_audio_files",
  auth(USER_ROLE.admin),
  upload.array("files", 10), // ✅ multiple files upload (max 10)
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch {
      next(new AppError(status.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  validationRequest( audioValidationSchema.audioSchema),
  AudioFileController.uploadAudioFile
);

route.get("/find_by_all_audio", auth(USER_ROLE.user), AudioFileController.findByAllAudio);

route.delete("/delete_audio_file/:id", auth(USER_ROLE.admin), AudioFileController.deleteAudioFile);




const audioRoutes=route;
export default audioRoutes;

