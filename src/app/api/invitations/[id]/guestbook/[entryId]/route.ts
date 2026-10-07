import { store } from "@/lib/db";
import { isInvitationId } from "@/lib/server/queries";
import { verifyPassword } from "@/lib/server/security";

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/invitations/[id]/guestbook/[entryId]">,
) {
  const { id, entryId } = await ctx.params;
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  const entry = isInvitationId(id) ? await store.getGuestbookEntry(id, entryId) : null;
  if (!entry) return Response.json({ error: "이미 삭제된 글이에요." }, { status: 404 });
  if (!(await verifyPassword(password, entry.passwordHash))) {
    return Response.json({ error: "비밀번호가 맞지 않아요." }, { status: 403 });
  }
  await store.deleteGuestbook(id, entryId);
  return Response.json({ ok: true });
}
