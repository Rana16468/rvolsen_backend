import status from "http-status";
import AppError from "../../errors/AppError";
import { RequestWithFile, UploadAudioResponse } from "./audiofile.interface";
import uploaduudios from "./audiofile.model";
import QueryBuilder from "../../builder/QueryBuilder";

import fs from "fs";

const uploadAudioFileIntoDb=async( req:RequestWithFile,userId:string):Promise< UploadAudioResponse >=>{


    try {
    const files = req.files   as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError(status.BAD_REQUEST, "No audio files uploaded", "");
    }

    const uploadedAudios = await Promise.all(
      files.map(async (file:any) => {
        const audioUrl = file.path.replace(/\\/g, "/");
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
    const isExist = await uploaduudios.findOne({ _id: id }).select("_id audioUrl");

    if (!isExist) {
      throw new AppError(status.NOT_FOUND, "Audio not found");
    }

    // Delete file from filesystem
    const filePath = isExist.audioUrl;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Optionally remove from DB
    await uploaduudios.findByIdAndDelete(id);

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
}


const AudioFileServices={
    uploadAudioFileIntoDb,
    findByAllAudioIntoDb,
     deleteAudioFileIntoDb
};

export default AudioFileServices;