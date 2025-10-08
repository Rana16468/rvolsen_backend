import status from "http-status";
import AppError from "../../errors/AppError";
import { RequestWithFile, VideoFileResponse } from "./videofile.interface";
import videofiles from "./videofile.model";
import QueryBuilder from "../../builder/QueryBuilder";

import fs from "fs";
import mongoose from "mongoose";

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


type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

const findByAllVideoSocialFeedIntoDb = async (query: Record<string, unknown>) => {
  try {
 
    const page = parseInt((query as any).page as string) || 1;
    const limit = parseInt((query as any).limit as string) || 10;
    const skip = (page - 1) * limit;

    
    const pipeline: any[] = [
      { $match: { isDelete: { $ne: true } } }, 

      
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Lookup likes
      {
        $lookup: {
          from: "reactlikes",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$videofileId", "$$videoId"] }, { $eq: ["$isLike", true] }] },
              },
            },
          ],
          as: "likes",
        },
      },

    
      {
        $lookup: {
          from: "reactdislikes",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$videofileId", "$$videoId"] }, { $eq: ["$dislike", true] }] },
              },
            },
          ],
          as: "dislikes",
        },
      },

    
      {
        $addFields: {
          isLike: { $gt: [{ $size: "$likes" }, 0] },
          isDislike: { $gt: [{ $size: "$dislikes" }, 0] },
        },
      },

      // Project required fields
      {
        $project: {
          title: 1,
          videoUrl: 1,
          like: 1,
          dislike: 1,
          share: 1,
          "user.name": 1,
          "user.photo": 1,
          isLike: 1,
          isDislike: 1,
        },
      },

      { $sort: { createdAt: -1 } }, // Optional: default sort
      { $skip: skip },
      { $limit: limit },
    ];

    // 3️⃣ Execute aggregation
    const socialFeeds = await videofiles.aggregate(pipeline);

    // 4️⃣ Total count for meta (respects filters)
    const totalResult = await videofiles.aggregate([
      { $match: { isDelete: { $ne: true } } },
      { $count: "total" },
    ]);
    const total = totalResult[0]?.total || 0;
    const totalPage = Math.ceil(total / limit);

    const meta: TMeta = {
      page,
      limit,
      total,
      totalPage,
    };

    return { meta, socialFeeds };
  } catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error find By All Video Social Feed IntoDb",
      error
    );
  }
};




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


const getVideoGrowthIntoDb = async (query: { year?: string }) => {
  try {
    const year = query.year ? parseInt(query.year) : new Date().getFullYear();
    const previousYear = year - 1;

    // Get current year stats (monthly + total)
    const currentYearStats = await videofiles.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          count: 1,
          _id: 0,
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$count" },
          data: { $push: { month: "$month", count: "$count" } },
        },
      },
      {
        $project: {
          totalCount: 1,
          months: {
            $map: {
              input: { $range: [1, 13] },
              as: "m",
              in: {
                year,
                month: "$$m",
                count: {
                  $let: {
                    vars: {
                      matched: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$data",
                              as: "d",
                              cond: { $eq: ["$$d.month", "$$m"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: { $ifNull: ["$$matched.count", 0] },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    // Get previous year total count (simplified)
    const previousYearCount = await videofiles.countDocuments({
      createdAt: {
        $gte: new Date(`${previousYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${previousYear}-12-31T23:59:59.999Z`),
      },
    });

    const currentYearTotal = currentYearStats[0]?.totalCount || 0;

    // Calculate year-over-year growth
    let yearlyGrowth = 0;
    if (previousYearCount > 0) {
      yearlyGrowth =
        ((currentYearTotal - previousYearCount) / previousYearCount) * 100;
    } else if (currentYearTotal > 0) {
      yearlyGrowth = 100;
    }

    const monthlyStats = currentYearStats[0]?.months || [];

    return {
      monthlyStats,
      yearlyGrowth: parseFloat(yearlyGrowth.toFixed(2)),
  
      year,
    };
  } catch (error: any) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to fetch video creation stats",
      error
    );
  }
};



const VideoFilesServices={
     uploadVideoFileIntoDb,
     findByAllVideoSocialFeedIntoDb,
     findMyAllVideoSocialFeedIntoDb,
      deleteVideoFileIntoDb,
      getVideoGrowthIntoDb
};

export default  VideoFilesServices;