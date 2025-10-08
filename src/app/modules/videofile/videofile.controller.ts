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


const  findByAllVideoSocialFeed:RequestHandler=catchAsync(async(req , res)=>{

      const result=await VideoFilesServices.findByAllVideoSocialFeedIntoDb(req.query);
                        sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully Find By All Video",
    data: result,
  });

});


const findMyAllVideoSocialFeed:RequestHandler=catchAsync(async(req , res)=>{

      const result=await VideoFilesServices.findMyAllVideoSocialFeedIntoDb(req.query, req.user.id);
       sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully Find My All Video",
    data: result,
  });
});


const  deleteVideoFile:RequestHandler=catchAsync(async(req , res)=>{

      const  result=await VideoFilesServices.deleteVideoFileIntoDb(req.params.id);
      sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully  Delete Video",
    data: result,
  });


})

const VideoFilesController={
    uploadVideoFile,
    findByAllVideoSocialFeed,
    findMyAllVideoSocialFeed,
    deleteVideoFile
};

export default  VideoFilesController;


