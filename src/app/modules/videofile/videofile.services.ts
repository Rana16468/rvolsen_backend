import status from "http-status";
import AppError from "../../errors/AppError";
import { RequestWithFile, VideoFileResponse } from "./videofile.interface";
import videofiles from "./videofile.model";

const uploadVideoFileIntoDb=async( req:RequestWithFile,userId:string):Promise< VideoFileResponse >=>{


    try {
    const files = req.files   as Express.Multer.File[];

    const data= req.body;

    if (!files || files.length === 0) {
      throw new AppError(status.BAD_REQUEST, "No audio files uploaded", "");
    }

    const uploadedVideo = await Promise.all(
      files.map(async (file:any) => {
        const videoUrl = file.path.replace(/\\/g, "/");
        return await  videofiles.create({
          userId,
          videoUrl,
          ...data
         
        });
      })
    );

    if(!uploadedVideo){
        throw new AppError(status.NOT_EXTENDED ,'issues by the  upload video server section ', '')
    };
    return {
        status:true,
        message:"successfully  recorded"
    }
  } catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error uploading multiple video files",
      error
    );
  }
     
};


const VideoFilesServices={
     uploadVideoFileIntoDb
};

export default  VideoFilesServices;