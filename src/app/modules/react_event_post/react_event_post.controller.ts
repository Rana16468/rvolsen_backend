import { RequestHandler } from "express";
import catchAsync from "../../utils/asyncCatch";
import ReactEventPostServices from "./react_event_post.services";
import status from "http-status";
import sendResponse from "../../utils/sendResponse";



const  recordedReactEventPost:RequestHandler=catchAsync(async(req , res)=>{

          const result =await  ReactEventPostServices.recordedReactEventPostIntoDb(req.body, req.user.id);
    sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully Recorded ",
    data: result,
  });
});


const disLikeReactEventPost:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ReactEventPostServices.recordedReactEventPostIntoDb(req.body, req.user.id);
    sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully Recorded Dislike ",
    data: result,
  });

});


const shareReactEventPost:RequestHandler=catchAsync(async(req , res)=>{

      const  result=await ReactEventPostServices.shareReactEventPostIntoDb(req.body, req.user.id);
          sendResponse(res, {
         success: true,
         statusCode: status.OK,
         message: "Successfully Share ",
        data: result,
  });
})

const ReactEventPostController={
    recordedReactEventPost,
    disLikeReactEventPost,
    shareReactEventPost
};

export default ReactEventPostController;