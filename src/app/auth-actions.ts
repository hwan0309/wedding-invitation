"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ONE_TAP_OFF_COOKIE } from "@/lib/auth/constants";
import { endSession } from "@/lib/auth/session";

export async function signOut() {
  await endSession();
  // 로그아웃하자마자 구글 원탭이 다시 자동 로그인시키지 않도록(다음 로그인 때 해제)
  (await cookies()).set(ONE_TAP_OFF_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/");
}
