import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;
const hasDatabase = !!process.env.DATABASE_URL;

const providers = [];
if (githubId && githubSecret) {
  providers.push(
    GitHubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export const isAuthConfigured = providers.length > 0;
export const isPersistenceEnabled = hasDatabase;
