import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

export type SessionData = {
  userId?: string;
  role?: Role;
  familyId?: string;
  displayName?: string;
  username?: string;
  isLoggedIn: boolean;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "kids_credit_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role || !session.familyId) {
    return null;
  }
  return session as SessionData & {
    userId: string;
    role: Role;
    familyId: string;
    displayName: string;
    username: string;
    isLoggedIn: true;
  };
}

export async function requireParent() {
  const session = await requireSession();
  if (!session || session.role !== "parent") return null;
  return session;
}

export async function requireKid() {
  const session = await requireSession();
  if (!session || session.role !== "kid") return null;
  return session;
}
