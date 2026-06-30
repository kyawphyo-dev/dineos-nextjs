import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { StaffRole } from "./auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(
          "[Auth] Password login attempt with credentials:",
          credentials,
        );

        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing email or password");
          return null;
        }

        // Check Owner table first
        const owner = await prisma.owner.findUnique({
          where: { email: credentials.email },
        });
        console.log("[Auth] Found owner:", owner ? owner.email : "none");

        if (owner) {
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            owner.hashedPassword,
          );
          console.log("[Auth] Owner password match:", passwordMatch);

          if (passwordMatch) {
            return {
              id: owner.id,
              name: owner.name,
              email: owner.email,
              role: owner.role as StaffRole,
              branchId: null,
              restaurantId: null,
              companyId: owner.companyId,
            };
          }
          return null;
        }

        // If not found in Owner, check Staff table
        const staff = await prisma.staff.findUnique({
          where: { email: credentials.email },
        });
        console.log("[Auth] Found staff:", staff ? staff.email : "none");

        if (!staff || !staff.hashedPassword) {
          console.log("[Auth] Staff not found or no password");
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          staff.hashedPassword,
        );
        console.log("[Auth] Staff password match:", passwordMatch);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          branchId: staff.branchId,
          restaurantId: staff.restaurantId,
          companyId: null,
        };
      },
    }),
    CredentialsProvider({
      id: "pin",
      name: "Username and PIN",
      credentials: {
        username: { label: "Username", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth] PIN login attempt with credentials:", credentials);

        if (!credentials?.username || !credentials?.pin) {
          console.log("[Auth] Missing username or pin");
          return null;
        }

        // Check Owner table first
        const owner = await prisma.owner.findUnique({
          where: { username: credentials.username },
        });
        console.log(
          "[Auth] Found owner by username:",
          owner ? owner.username : "none",
        );

        if (owner) {
          const pinMatch = await bcrypt.compare(
            credentials.pin,
            owner.hashedPin,
          );
          console.log("[Auth] Owner pin match:", pinMatch);

          if (pinMatch) {
            return {
              id: owner.id,
              name: owner.name,
              email: owner.email,
              role: owner.role as StaffRole,
              branchId: null,
              restaurantId: null,
              companyId: owner.companyId,
            };
          }
          return null;
        }

        // If not found in Owner, check Staff table
        const staff = await prisma.staff.findUnique({
          where: { username: credentials.username },
        });
        console.log(
          "[Auth] Found staff by username:",
          staff ? staff.username : "none",
        );

        if (!staff || !staff.hashedPin) {
          console.log("[Auth] Staff not found or no pin");
          return null;
        }

        const pinMatch = await bcrypt.compare(credentials.pin, staff.hashedPin);
        console.log("[Auth] Staff pin match:", pinMatch);

        if (!pinMatch) {
          return null;
        }

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          branchId: staff.branchId,
          restaurantId: staff.restaurantId,
          companyId: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.branchId = (user as any).branchId;
        token.restaurantId = (user as any).restaurantId;
        token.companyId = (user as any).companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).branchId = token.branchId;
        (session.user as any).restaurantId = token.restaurantId;
        (session.user as any).companyId = token.companyId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
