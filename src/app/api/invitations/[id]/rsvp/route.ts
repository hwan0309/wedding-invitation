import { store } from "@/lib/db";
import { parseRsvpInput } from "@/lib/invitation/guest";
import { isInvitationId } from "@/lib/server/queries";
import { shortId } from "@/lib/server/security";

export async function POST(request: Request, ctx: RouteContext<"/api/invitations/[id]/rsvp">) {
  const { id } = await ctx.params;
  const record = isInvitationId(id) ? await store.getInvitation(id) : null;
  if (!record?.data.rsvp.enabled) {
    return Response.json({ error: "참석 의사를 받을 수 없는 청첩장이에요." }, { status: 404 });
  }

  const parsed = parseRsvpInput(await request.json().catch(() => null));
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  await store.insertRsvp({
    id: shortId(12),
    invitationId: id,
    ...parsed.value,
    createdAt: new Date().toISOString(),
  });
  return Response.json({ ok: true }, { status: 201 });
}
