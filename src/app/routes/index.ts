import express from "express";
import UserRouters from "../modules/user/user.route";
import AuthRouter from "../modules/auth/auth.route";
import SettingsRoutes from "../modules/settings/settings.routres";
import audioRoutes from "../modules/audiofile/audiofile.route";
import videoFileRoutes from "../modules/videofile/videofile.route";
import ReactEvents from "../modules/react_event_post/react_event_post.route";


const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route:UserRouters,
  },
  {
    path:"/auth",
    route: AuthRouter
  },
  {
    path:"/setting",
    route: SettingsRoutes
  },
  {
    path:"/audio",
    route: audioRoutes
  },
  {
    path:"/video",
    route: videoFileRoutes
  },
  {
    path:"/react",
    route:  ReactEvents
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;