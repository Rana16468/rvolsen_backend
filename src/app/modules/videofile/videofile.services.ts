import status from "http-status";
import AppError from "../../errors/AppError";
import { RequestWithFile, VideoFileResponse } from "./videofile.interface";
import videofiles from "./videofile.model";
import QueryBuilder from "../../builder/QueryBuilder";

import fs from "fs";

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


const findByAllVideoSocialFeedIntoDb=async (query: Record<string, unknown>)=>{
  try{

         const allVideoSocialFeedQuery = new QueryBuilder(
                  videofiles.find({}).populate([
                      {
            path: 'userId',
            select: 'name  photo',
          },
                ]).select(" -isDelete -updatedAt").lean(),
              query     
            )
              .search([]) 
              .filter()                          
              .sort()                            
              .paginate()                       
              .fields(); 
        
            const socialFeeds = await allVideoSocialFeedQuery .modelQuery;
            const meta = await allVideoSocialFeedQuery .countTotal();
        
            return { meta,  socialFeeds };

    }

    catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error find By All Video Social Feed IntoDb",
      error
    );
  }
}



const findMyAllVideoSocialFeedIntoDb=async (query: Record<string, unknown>, userId:string)=>{
  try{

         const myVideoSocialFeedQuery = new QueryBuilder(
                  videofiles.find({userId}).populate([
      
                ]).select(" -isDelete -updatedAt -userId -dislike -share").lean(),
              query     
            )
              .search([]) 
              .filter()                          
              .sort()                            
              .paginate()                       
              .fields(); 
        
            const mysocialFeeds = await myVideoSocialFeedQuery .modelQuery;
            const meta = await myVideoSocialFeedQuery .countTotal();
        
            return { meta, mysocialFeeds  };

    }

    catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error find By All Video Social Feed IntoDb",
      error
    );
  }
};

 const deleteVideoFileIntoDb = async (id: string) => {
  try {
    const isExist = await videofiles.findOne({ _id: id }).select("_id videoUrl");

    if (!isExist) {
      throw new AppError(status.NOT_FOUND, "Video not found");
    }

    const filePath = isExist.videoUrl
;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await videofiles.findByIdAndDelete(id);

    return {
      success: true,
      message: "Successfully deleted audio",
    };
  } catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error deleting audio file",
      error
    );
  }
};


const VideoFilesServices={
     uploadVideoFileIntoDb,
     findByAllVideoSocialFeedIntoDb,
     findMyAllVideoSocialFeedIntoDb,
      deleteVideoFileIntoDb
};

export default  VideoFilesServices;