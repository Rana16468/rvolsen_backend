import { z } from "zod";
import { USER_ACCESSIBILITY, USER_ROLE, socialAuth } from "./user.constant";

const createUserSchema = z.object({
    body: z.object({
        name: z.string({
    error: "User name is required",
  }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),

  email: z
    .string({
      error: "Email is required",
    })
    .email("Invalid email format")
    .trim(),

  phoneNumber: z
    .string()
    .min(6, "Phone number must be at least 6 digits")
    .max(20, "Phone number too long")
    .nullable()
    .optional(),

  verificationCode: z
    .number()
    .optional()
    .nullable(),

  isVerify: z.boolean().optional().default(false),

  role: z
    .enum([
      USER_ROLE.admin,
      USER_ROLE.user,
      USER_ROLE.superAdmin,
    ])
    .default(USER_ROLE.user),

  provider: z
    .enum([socialAuth.googleAuth, socialAuth.appleAuth])
    .optional()
    .nullable(),

  status: z
    .enum([
      USER_ACCESSIBILITY.isProgress,
      USER_ACCESSIBILITY.blocked,
    ])
    .default(USER_ACCESSIBILITY.isProgress),

  location: z.string().nullable().optional(),
    })
});

const UserVerification = z.object({
  body: z.object({
    verificationCode: z
      .number({ error: "varification code is required" })
      .min(6, { message: "min 6 character accepted" }),
  }),
});

const ChangePasswordSchema = z.object({
  body: z.object({
    newpassword: z
      .string({ error: "new password is required" })
      .min(6, { message: "min 6 character accepted" }),
    oldpassword: z
      .string({ error: "old password is  required" })
      .min(6, { message: "min 6 character accepted" }),
  }),
});

const UpdateUserProfileSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "user name is required" })
      .min(3, { message: "min 3 character accepted" })
      .max(15, { message: "max 15 character accepted" })
      .optional(),

     phoneNumber: z.string({ error: "phone number is option" }).optional(),
     location: z.string({ error: "address is not required" }).optional(),
    photo: z.string({ error: "optional photot" }).url().optional(),

  }),
});

const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is Required" })
      .email("Invalid email format")
      .refine(
        (email) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        {
          message: "Invalid email format",
        }
      ),
  }),
});

const verificationCodeSchema = z.object({
  body: z.object({
    verificationCode: z
      .number({ error: " verificationCode is require" })
      .min(4, { message: "min 4  number accepted" }),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    userId: z.string({ error: "userId is require" }),
    password: z.string({ error: "password is require" }),
  }),
});


const UserValidationSchema={
    createUserSchema,
     UserVerification,
     ChangePasswordSchema,
     UpdateUserProfileSchema,
      ForgotPasswordSchema,
      verificationCodeSchema,
      resetPasswordSchema
};

export default UserValidationSchema


