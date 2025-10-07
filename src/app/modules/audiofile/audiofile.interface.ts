import { Model, Types } from "mongoose";



export interface  TUploadAudio {

    userId:Types.ObjectId;
    audioUrl:string;
    isDelete:boolean;

};


export interface UploadAudioModel extends Model<TUploadAudio > {
  // eslint-disable-next-line no-unused-vars
  isUploadCustomId(id: string): Promise<TUploadAudio >;
};

export interface UploadAudioResponse {
  status: boolean;
  message: string;
};


export interface RequestWithFile extends Request {
  file?: Express.Multer.File;           // For single file upload
  files?: Express.Multer.File[];        // ✅ For multiple file uploads
}