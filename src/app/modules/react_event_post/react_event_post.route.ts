import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import validationRequest from '../../middlewares/validationRequest';
import ReactValidation from './react_event_post.validation';
import ReactEventPostController from './react_event_post.controller';

const route=express.Router();

route.post("/isLikeReact", auth(USER_ROLE.user), validationRequest( ReactValidation.isLikeReactSchema),ReactEventPostController.recordedReactEventPost );
route.post("/isDisLikeReact", auth(USER_ROLE.user), validationRequest(ReactValidation.isDisLikeReactSchema), ReactEventPostController.disLikeReactEventPost);



const ReactEvents=route;

export default ReactEvents;