import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { store, type UserRecord } from "../db";
import {
  BROWSER_SESSION_MS,
  PERSISTENT_SESSION_MS,
  PERSISTENT_TOKEN_PREFIX,
  SESSION_COOKIE,
  SESSION_RENEW_BEFORE_MS,
} from "./constants";
import type { CurrentUser } from "./types";

export type { CurrentUser } from "./types";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const toCurrentUser = (u: UserRecord): CurrentUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  image: u.image,
  provider: u.provider,
});

/** 새 세션을 만들고 쿠키를 심는다. (Route Handler / Server Action 전용) */
export async function startSession(userId: string, persistent: boolean) {
  const jar = await cookies();
  // 이전 세션이 남아 있으면 정리(세션 고정 공격 방지 겸)
  const previous = jar.get(SESSION_COOKIE)?.value;
  if (previous) await store.deleteSession(hashToken(previous));

  const token = (persistent ? PERSISTENT_TOKEN_PREFIX : "s.") + randomBytes(32).toString("base64url");
  const now = Date.now();
  const expiresAt = new Date(now + (persistent ? PERSISTENT_SESSION_MS : BROWSER_SESSION_MS));
  await store.insertSession({
    id: hashToken(token),
    userId,
    persistent,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date(now).toISOString(),
  });

  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // 자동 로그인이면 만료일을 두고, 아니면 브라우저를 닫을 때 사라지는 쿠키
    ...(persistent ? { expires: expiresAt } : {}),
  });
}

async function validateToken(token: string): Promise<UserRecord | null> {
  const id = hashToken(token);
  const session = await store.getSession(id);
  if (!session) return null;

  const now = Date.now();
  const expires = Date.parse(session.expiresAt);
  if (now >= expires) {
    await store.deleteSession(id);
    return null;
  }
  const user = await store.getUser(session.userId);
  if (!user) {
    await store.deleteSession(id);
    return null;
  }
  // 자동 로그인 세션은 쓸 때마다 만료를 연장(브라우저 쿠키는 proxy가 연장)
  if (session.persistent && expires - now < SESSION_RENEW_BEFORE_MS) {
    await store.updateSessionExpiry(id, new Date(now + PERSISTENT_SESSION_MS).toISOString());
  }
  return user;
}

/**
 * 현재 로그인한 사용자. 같은 요청 안에서는 한 번만 조회한다.
 * 쿠키를 읽으므로 화면에서는 반드시 <Suspense> 안에서 호출한다.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await validateToken(token);
  return user ? toCurrentUser(user) : null;
});

/** 현재 세션을 끝낸다. (Route Handler / Server Action 전용) */
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await store.deleteSession(hashToken(token));
  jar.delete(SESSION_COOKIE);
}
