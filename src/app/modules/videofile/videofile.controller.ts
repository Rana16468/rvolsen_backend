import { RequestHandler } from "express";
import catchAsync from "../../utils/asyncCatch";
import VideoFilesServices from "./videofile.services";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";



const  uploadVideoFile:RequestHandler=catchAsync(async(req , res)=>{

      const result=await VideoFilesServices.uploadVideoFileIntoDb(req as any, req.user.id);
                         sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Successfully Recorded",
    data: result,
  });

});

const VideoFilesController={
    uploadVideoFile
};

export default  VideoFilesController;


