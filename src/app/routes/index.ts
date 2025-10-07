import express from "express";
import UserRouters from "../modules/user/user.route";
import AuthRouter from "../modules/auth/auth.route";
import SettingsRoutes from "../modules/settings/settings.routres";
import audioRoutes from "../modules/audiofile/audiofile.route";


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
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;