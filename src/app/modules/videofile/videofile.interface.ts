import { Model, Types } from "mongoose";


export interface TVideoFile {
        userId:Types.ObjectId;
        videoUrl:string;
        title:string;
        like:Number;
        dislike:Number;
        share:Number;
        isDelete:boolean;
};


export interface VideoFileModel extends Model<TVideoFile > {
  isVideoFileCustomId(id: string): Promise<TVideoFile >;
};

export interface VideoFileResponse {
  status: boolean;
  message: string;
};

export interface RequestWithFile extends Request {
  file?: Express.Multer.File;           // For single file upload
  files?: Express.Multer.File[];        // ✅ For multiple file uploads
}
