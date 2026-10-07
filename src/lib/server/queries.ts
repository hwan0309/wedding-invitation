import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { store } from "../db";
import type { PublicInvitation } from "../invitation/types";

export const invitationTag = (id: string) => `invitation-${id}`;
export const isInvitationId = (id: string) => /^[a-z0-9]{6,20}$/.test(id);

/**
 * 하객용 청첩장 데이터. 결과를 캐시해서 하객이 몰려도 DB를 매번 읽지 않고,
 * 저장할 때 updateTag(invitationTag(id))로 캐시를 비워 수정 내용이 즉시 보이게 한다.
 */
export async function getPublicInvitation(id: string): Promise<PublicInvitation | null> {
  "use cache";
  cacheTag(invitationTag(id));
  cacheLife("hours");
  if (!isInvitationId(id)) return null;
  const record = await store.getInvitation(id);
  return record ? { id: record.id, data: record.data, updatedAt: record.updatedAt } : null;
}
