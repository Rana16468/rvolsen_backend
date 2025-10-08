import {z} from 'zod';


const isLikeReactSchema=z.object({
    body:z.object({

        videofileId:z.string({error:"videofileId is  required"}),
        isLike:z.boolean({error:"is React required "}).optional()
    })
});

const isDisLikeReactSchema=z.object({
    body:z.object({

        videofileId:z.string({error:"videofileId is  required"}),
        isLike:z.boolean({error:"is React required "}).optional()
    })
});

const isShareReactSchema=z.object({
    body:z.object({

        videofileId:z.string({error:"videofileId is  required"})
    })
});



const ReactValidation={
    isLikeReactSchema,
    isDisLikeReactSchema,
    isShareReactSchema

};


export default ReactValidation;