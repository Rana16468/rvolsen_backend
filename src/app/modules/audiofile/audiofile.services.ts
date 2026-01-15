import status from "http-status";
import AppError from "../../errors/AppError";
import { RequestWithFile, UploadAudioResponse } from "./audiofile.interface";
import uploaduudios from "./audiofile.model";
import QueryBuilder from "../../builder/QueryBuilder";

import fs from "fs/promises";
import path from "path";
import config from "../../config";
import { uploadToS3 } from "../../utils/uploadToS3";
import { deleteFromS3 } from "../../utils/deleteFromS3";

const uploadAudioFileIntoDb=async( req:RequestWithFile,userId:string):Promise< UploadAudioResponse >=>{


    try {
    const files = req.files   as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError(status.BAD_REQUEST, "No audio files uploaded", "");
    }

    const uploadedAudios = await Promise.all(
      files.map(async (file:any) => {
        // const audioUrl = file.path.replace(/\\/g, "/");
        const audioUrl = await uploadToS3(file, config.file_path);
        // upload audio file 
        //  updateData.photo = await uploadToS3(file, config.file_path);
        return await  uploaduudios.create({
          userId,
          audioUrl,
         
        });
      })
    );

    if(!uploadedAudios){
        throw new AppError(status.NOT_EXTENDED ,'issues by the  upload audio server section ', '')
    };
    return {
        status:true,
        message:"successfully  recorded"
    }
  } catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error uploading multiple audio files",
      error
    );
  }
     
};


const findByAllAudioIntoDb=async(query: Record<string, unknown>)=>{

    try{

         const allLiveEventQuery = new QueryBuilder(
                  uploaduudios.find({}).populate([
                   
                ]).select("-userId -isDelete -updatedAt").lean(),
              query     
            )
              .search([]) 
              .filter()                          
              .sort()                            
              .paginate()                       
              .fields(); 
        
            const liveEvent = await allLiveEventQuery .modelQuery;
            const meta = await allLiveEventQuery .countTotal();
        
            return { meta,  liveEvent };

    }

    catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error find By All Audio IntoDb",
      error
    );
  }

     
}


const deleteAudioFileIntoDb = async (id: string) => {
  try {
    const audio = await uploaduudios
      .findById(id)
      .select("audioUrl")
      .lean();

    if (!audio?.audioUrl) {
      throw new AppError(status.NOT_FOUND, "Audio not found");
    }

    const audioUrl = audio.audioUrl;

    // Delete from S3 (if using S3)
    const isAudioDelete=await deleteFromS3(audioUrl);

    if(!isAudioDelete){
      throw  new AppError(status.NOT_EXTENDED, 'issues by the audio file delete section')
    };
    // Delete from local filesystem (if stored locally)
    const localPath = path.resolve(audioUrl);
    try {
      await fs.access(localPath);
      await fs.unlink(localPath);
    } catch {
      // Ignore if file does not exist locally
    }

    // Remove from DB
    await uploaduudios.findByIdAndDelete(id);

    return {
      success: true,
      message: "Audio deleted successfully",
    };
  } catch (error:any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to delete audio file",
      error
    );
  }
};


const myRecordingSoundLibraryIntoDb=async(userId:string, query: Record<string, unknown>)=>{
  try{

             const myRecordingSoundQuery = new QueryBuilder(
                  uploaduudios.find({userId}).populate([
                     {
            path: 'userId',
            select: 'name photo',
          },
                   
                ]).select("-userId -isDelete -updatedAt").lean(),
              query     
            )
              .search([]) 
              .filter()                          
              .sort()                            
              .paginate()                       
              .fields(); 
        
            const myRecordLibrary= await myRecordingSoundQuery .modelQuery;
            const meta = await myRecordingSoundQuery .countTotal();
        
            return { meta,myRecordLibrary };

    }

    catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error  my Recording Sound Library Into Db",
      error
    );
  }
     
}


const AudioFileServices={
    uploadAudioFileIntoDb,
    findByAllAudioIntoDb,
     deleteAudioFileIntoDb,
      myRecordingSoundLibraryIntoDb
};

export default AudioFileServices;