import express from "express";
import validationRequest from "../../middlewares/validationRequest";
import UserValidationSchema from "./user.validation";
import UserController from "./user.controller";
import { USER_ROLE } from "./user.constant";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/create_user",
  validationRequest(UserValidationSchema.createUserSchema),
  UserController.createUser
);

router.patch(
  "/user_verification",
  validationRequest(UserValidationSchema.UserVerification),
  UserController.userVarification
);

router.patch(
  "/change_password",
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.user,
   
  ),
  validationRequest(UserValidationSchema.ChangePasswordSchema),
  UserController.chnagePassword
);

router.post(
  "/forgot_password",
  validationRequest(UserValidationSchema.ForgotPasswordSchema),
  UserController.forgotPassword
);

router.post(
  "/verification_forgot_user",
  validationRequest(UserValidationSchema.verificationCodeSchema),
  UserController.verificationForgotUser
);

router.post(
  "/reset_password",
  validationRequest(UserValidationSchema.resetPasswordSchema),
  UserController.resetPassword
);

router.post(
  "/google_auth",
  validationRequest(UserValidationSchema.createUserSchema),
  UserController.googleAuth
);
router.get("/find_by_user_growth", auth(USER_ROLE.admin, USER_ROLE.superAdmin), UserController.getUserGrowth);
router.get("/resend_verification_otp/:email",UserController.resendVerificationOtp);


const UserRouters = router;
export default UserRouters;
