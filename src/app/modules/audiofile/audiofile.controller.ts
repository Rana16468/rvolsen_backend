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
});

const  deleteAudioFile:RequestHandler=catchAsync(async(req , res)=>{

       const result=await AudioFileServices.deleteAudioFileIntoDb(req.params.id);
                   sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully Delete Audio",
    data: result,
  });
});


const  myRecordingSoundLibrary:RequestHandler=catchAsync(async(req , res)=>{

      const result=await AudioFileServices.myRecordingSoundLibraryIntoDb(req.user.id, req.query);
                         sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully My Record Sound",
    data: result,
  });
});




const  AudioFileController={
    uploadAudioFile,
    findByAllAudio,
     deleteAudioFile,
     myRecordingSoundLibrary
};

export default AudioFileController;