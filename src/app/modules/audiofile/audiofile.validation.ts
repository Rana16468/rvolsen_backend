import { z } from "zod";

const audioSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  audioUrl: z.string().optional()
  
});

const audioValidationSchema = {
  audioSchema,
};

export default audioValidationSchema;
