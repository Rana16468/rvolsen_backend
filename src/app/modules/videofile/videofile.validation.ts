
import {z} from 'zod';

 const createVideoFileZodSchema = z.object({
 body: z.object({
      videoUrl: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  like: z.number().optional().default(0),
  dislike: z.number().optional().default(0),
  share: z.number().optional().default(0)

 })
});

const VideoFileValidation={
    createVideoFileZodSchema 
};

export default VideoFileValidation;