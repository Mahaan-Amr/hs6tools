import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { activeAccountAuthority } from "@/lib/staff-authority";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email as string,
              isActive: true,
              deletedAt: null,
            }
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          });

          // Return the user object - this is what gets passed to callbacks
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            avatar: user.avatar,
            company: user.company,
            position: user.position,
            lastLoginAt: new Date().toISOString()
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    // This callback runs to create the JWT token
    async jwt({ token, user }) {
      // Initial sign in - user data is available here for CredentialsProvider
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isActive = user.isActive;
        token.emailVerified = Boolean(user.emailVerified);
        token.phoneVerified = Boolean(user.phoneVerified);
        token.avatar = user.avatar;
        token.company = user.company;
        token.position = user.position;
        token.lastLoginAt = user.lastLoginAt;
      }

      const currentAccount = token.id
        ? await prisma.user.findUnique({
            where: { id: token.id },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              deletedAt: true,
              emailVerified: true,
              phoneVerified: true,
              avatar: true,
              company: true,
              position: true,
              lastLoginAt: true,
            },
          })
        : null;

      const currentAuthority = activeAccountAuthority(currentAccount);
      if (!currentAccount || !currentAuthority) {
        token.role = null;
        token.isActive = false;
        return token;
      }

      token.id = currentAccount.id;
      token.email = currentAccount.email;
      token.firstName = currentAccount.firstName;
      token.lastName = currentAccount.lastName;
      token.role = currentAuthority.role;
      token.isActive = currentAccount.isActive;
      token.emailVerified = currentAccount.emailVerified;
      token.phoneVerified = currentAccount.phoneVerified;
      token.avatar = currentAccount.avatar;
      token.company = currentAccount.company;
      token.position = currentAccount.position;
      token.lastLoginAt = currentAccount.lastLoginAt?.toISOString() ?? null;

      // Return the token
      return token;
    },
    
    // This callback runs to create the session
    async session({ session, token }) {
      if (token) {
        // Set NextAuth default fields (required by NextAuth)
        session.user.name = token.firstName && token.lastName 
          ? `${token.firstName} ${token.lastName}`.trim()
          : (token.email as string) || undefined;
        session.user.image = (token.avatar as string | null | undefined) || undefined;
        
        // Set custom fields
        session.user.id = token.id as string;
        // A null role is intentional: it makes every existing role guard fail
        // closed after the account is disabled, deleted, or removed.
        session.user.role = token.role as UserRole;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isActive = token.isActive as boolean;
        session.user.emailVerified = token.emailVerified as boolean;
        session.user.phoneVerified = token.phoneVerified as boolean;
        session.user.avatar = token.avatar as string | null | undefined;
        session.user.company = token.company as string | null | undefined;
        session.user.position = token.position as string | null | undefined;
        session.user.lastLoginAt = token.lastLoginAt as string | null | undefined;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  }
};

export default NextAuth(authOptions);
