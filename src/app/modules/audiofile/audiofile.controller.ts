import { RequestHandler } from "express";
import catchAsync from "../../utils/asyncCatch";
import AudioFileServices from "./audiofile.services";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";



const  uploadAudioFile:RequestHandler=catchAsync(async(req , res)=>{

         const result= await AudioFileServices.uploadAudioFileIntoDb(req as any, req.user.id);
           sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully  Upload Audio File Successfully",
    data: result,
  });
});


const findByAllAudio:RequestHandler=catchAsync(async(req , res)=>{

      const result=await AudioFileServices.findByAllAudioIntoDb(req.query);
               sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully Find By All Audio",
    data: result,
  });
})


const  AudioFileController={
    uploadAudioFile,
    findByAllAudio
};

export default AudioFileController;