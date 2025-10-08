import { Model, Types } from "mongoose";



export interface TReactLike {
     videofileId: Types.ObjectId;
     userId:Types.ObjectId;
     isLike:Boolean;
    isDelete:Boolean;

};

export interface ReactEventPostModel extends Model< TReactLike> {
  isReactEventPostCustomId(id: string): Promise< TReactLike>;
};



export interface TReactDisLike {
     videofileId: Types.ObjectId;
     userId:Types.ObjectId;
     dislike:Boolean;
     isDelete:Boolean;

};

export interface DisLikeReactEventPostModel extends Model< TReactDisLike> {
  isDisLikeReactEventPostCustomId(id: string): Promise< TReactDisLike>;
}





