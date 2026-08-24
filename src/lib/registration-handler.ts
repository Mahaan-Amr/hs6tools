import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { getPhoneVerificationLifecycle } from "@/lib/phone-verification";
import { SMSIRFastSendTemplates, sendTemplateSMSSafe } from "@/lib/sms";
import { isAllowedOrigin } from "@/utils/origin";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().regex(/^09\d{9}$/, "Invalid phone number format"),
    verificationProof: z.string().min(20, "Verification proof is required"),
  })
  .strict();

type RegistrationInput = z.infer<typeof registerSchema>;
type RegisteredUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
};

async function createVerifiedUser(
  data: RegistrationInput,
  passwordHash: string,
) {
  const registration = await getPhoneVerificationLifecycle().consume(
    data.phone,
    "PHONE_VERIFICATION",
    data.verificationProof,
    (transaction) =>
      transaction.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: "CUSTOMER",
          isActive: true,
          emailVerified: false,
          phoneVerified: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
        },
      }),
  );
  return registration.status === "consumed" ? registration.value : null;
}

type RegistrationDependencies = {
  hashPassword: (password: string) => Promise<string>;
  createVerifiedUser: (
    data: RegistrationInput,
    passwordHash: string,
  ) => Promise<RegisteredUser | null>;
  sendWelcome: (user: RegisteredUser) => void;
};

const defaultDependencies: RegistrationDependencies = {
  hashPassword: (password) => bcrypt.hash(password, 12),
  createVerifiedUser,
  sendWelcome(user) {
    const customerName = `${user.firstName} ${user.lastName}`;
    void sendTemplateSMSSafe(
      {
        receptor: user.phone!,
        templateEnvKey: "SMSIR_WELCOME_SIMPLE_TEMPLATE_ID",
        parameters: { CUSTOMER: customerName },
      },
      SMSIRFastSendTemplates.WELCOME_SIMPLE(customerName),
      "New customer welcome message",
    );
  },
};

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function createRegistrationHandler(
  dependencies: RegistrationDependencies = defaultDependencies,
) {
  return async function register(request: NextRequest) {
    try {
      if (
        !isAllowedOrigin(
          request.headers.get("origin"),
          request.headers.get("host") || "",
        )
      ) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
      }
      if (
        !checkRateLimit(clientIp(request), 3, 15 * 60 * 1000, "register")
          .allowed
      ) {
        return NextResponse.json(
          { error: "Too many registration attempts. Please try again later." },
          { status: 429 },
        );
      }

      const data = registerSchema.parse(await request.json());
      const passwordHash = await dependencies.hashPassword(data.password);
      const user = await dependencies.createVerifiedUser(data, passwordHash);
      if (!user) {
        return NextResponse.json(
          { error: "A valid phone verification proof is required" },
          { status: 400 },
        );
      }

      dependencies.sendWelcome(user);
      return NextResponse.json(
        { message: "User registered successfully", user },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.issues },
          { status: 400 },
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Registration could not be completed" },
          { status: 400 },
        );
      }
      console.error("Registration failed");
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
