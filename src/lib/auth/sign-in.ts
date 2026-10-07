import "server-only";
import { cookies } from "next/headers";
import { store, type AuthProvider } from "../db";
import { shortId } from "../server/security";
import { ONE_TAP_OFF_COOKIE } from "./constants";
import type { OAuthProfile } from "./oauth";
import { startSession } from "./session";

/**
 * 소셜 로그인 완료 처리: 처음이면 가입, 아니면 프로필 갱신 후 세션 시작.
 * (같은 이메일이라도 카카오·구글 계정은 별도 사용자로 취급한다. 카카오 이메일은 선택 동의라 신뢰할 수 없기 때문)
 */
export async function signIn(provider: AuthProvider, profile: OAuthProfile, persistent: boolean) {
  const now = new Date().toISOString();
  const existing = await store.findUserByProvider(provider, profile.providerUserId);
  let userId: string;

  if (existing) {
    userId = existing.id;
    await store.updateUser(userId, {
      name: profile.name || existing.name,
      email: profile.email || existing.email,
      image: profile.image,
      lastLoginAt: now,
    });
  } else {
    userId = shortId(12);
    await store.insertUser({
      id: userId,
      provider,
      providerUserId: profile.providerUserId,
      name: profile.name || "사용자",
      email: profile.email,
      image: profile.image,
      createdAt: now,
      lastLoginAt: now,
    });
  }

  await startSession(userId, persistent);
  (await cookies()).delete(ONE_TAP_OFF_COOKIE);
}
