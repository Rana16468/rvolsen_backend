import  express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import upload from '../../utils/uploadFile';
import AppError from '../../errors/AppError';
import status from 'http-status';
import validationRequest from '../../middlewares/validationRequest';
import VideoFileValidation from './videofile.validation';
import VideoFilesController from './videofile.controller';


const route = express.Router();
route.post(
  "/upload_video_files",
  auth(USER_ROLE.admin,USER_ROLE.user),
  upload.array("files", 10),
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
  validationRequest(  VideoFileValidation.createVideoFileZodSchema),
  VideoFilesController.uploadVideoFile
);

route.get("/find_by_all_social_feed_video", auth(USER_ROLE.user), VideoFilesController.findByAllVideoSocialFeed)
route.get("/find_myl_social_feed_video", auth(USER_ROLE.user),VideoFilesController.findMyAllVideoSocialFeed);
route.delete("/delete_video_file/:id", auth(USER_ROLE.user,USER_ROLE.admin,USER_ROLE.superAdmin), VideoFilesController.deleteVideoFile);
route.get("/find_by_video_growth", auth(USER_ROLE.admin, USER_ROLE.superAdmin), VideoFilesController.getVideoGrowth);
route.get("/find_all_video", auth(USER_ROLE.admin,USER_ROLE.superAdmin),VideoFilesController.findAllVideo);
route.get("/dashboard_count", auth(USER_ROLE.admin,USER_ROLE.superAdmin), VideoFilesController.dashboardCount)

const videoFileRoutes=route;

export default videoFileRoutes;