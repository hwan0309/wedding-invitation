"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { LIMITS } from "@/lib/config";
import { store, type InvitationRecord } from "@/lib/db";
import { createSampleData } from "@/lib/invitation/defaults";
import { normalizeData, validateData } from "@/lib/invitation/normalize";
import { isThemeId } from "@/lib/invitation/themes";
import { getCurrentUser } from "@/lib/auth/session";
import { invitationTag, isInvitationId } from "@/lib/server/queries";
import { shortId } from "@/lib/server/security";

export type ActionResult<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

const LIMIT_MESSAGE = `청첩장은 ${LIMITS.invitationsPerOwner}개까지 만들 수 있어요.`;
const LOGIN_EXPIRED = "로그인이 만료됐어요. 새 탭에서 다시 로그인한 뒤 저장해 주세요(수정한 내용은 그대로 있어요).";

/** 로그인한 사용자가 소유한 청첩장만 돌려준다(Server Action은 누구나 POST로 호출할 수 있으므로 매번 확인). */
async function ownedInvitation(id: string): Promise<{ error: string } | { record: InvitationRecord }> {
  const user = await getCurrentUser();
  if (!user) return { error: LOGIN_EXPIRED };
  const record = isInvitationId(id) ? await store.getInvitation(id) : null;
  if (!record || record.ownerId !== user.id) return { error: "이 청첩장을 수정할 권한이 없어요." };
  return { record };
}

export async function createInvitation(themeId: string): Promise<ActionResult> {
  const theme = isThemeId(themeId) ? themeId : "basic";
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/create?theme=${theme}`)}`);

  const mine = await store.listInvitations(user.id);
  if (mine.length >= LIMITS.invitationsPerOwner) return { ok: false, error: LIMIT_MESSAGE };

  const id = shortId();
  const now = new Date().toISOString();
  await store.insertInvitation({
    id,
    ownerId: user.id,
    data: createSampleData(theme),
    createdAt: now,
    updatedAt: now,
  });
  redirect(`/edit/${id}`);
}

export async function saveInvitation(
  id: string,
  input: unknown,
): Promise<ActionResult<{ updatedAt: string }>> {
  const owned = await ownedInvitation(id);
  if ("error" in owned) return { ok: false, error: owned.error };

  const data = normalizeData(input);
  const errors = validateData(data);
  if (errors.length) return { ok: false, error: errors[0] };

  const updatedAt = new Date().toISOString();
  await store.updateInvitation(id, data, updatedAt);
  // 하객용 페이지 캐시를 비운다 → 이미 보낸 링크·QR에서 바로 최신 내용이 보인다.
  updateTag(invitationTag(id));
  return { ok: true, updatedAt };
}

export async function deleteInvitation(id: string): Promise<ActionResult> {
  const owned = await ownedInvitation(id);
  if ("error" in owned) return { ok: false, error: owned.error };
  await store.deleteInvitation(id);
  updateTag(invitationTag(id));
  refresh();
  return { ok: true };
}

export async function duplicateInvitation(id: string): Promise<ActionResult> {
  const owned = await ownedInvitation(id);
  if ("error" in owned) return { ok: false, error: owned.error };
  const { record } = owned;
  const mine = await store.listInvitations(record.ownerId);
  if (mine.length >= LIMITS.invitationsPerOwner) return { ok: false, error: LIMIT_MESSAGE };

  const now = new Date().toISOString();
  await store.insertInvitation({
    id: shortId(),
    ownerId: record.ownerId,
    data: structuredClone(record.data),
    createdAt: now,
    updatedAt: now,
  });
  refresh();
  return { ok: true };
}

export async function deleteGuestbookAsOwner(
  invitationId: string,
  entryId: string,
): Promise<ActionResult> {
  const owned = await ownedInvitation(invitationId);
  if ("error" in owned) return { ok: false, error: owned.error };
  await store.deleteGuestbook(invitationId, entryId);
  refresh();
  return { ok: true };
}
