import { store } from "@/lib/db";
import { parseGuestbookInput, type GuestbookItem } from "@/lib/invitation/guest";
import { isInvitationId } from "@/lib/server/queries";
import { hashPassword, shortId } from "@/lib/server/security";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function openGuestbook(id: string) {
  if (!isInvitationId(id)) return null;
  const record = await store.getInvitation(id);
  return record?.data.guestbook.enabled ? record : null;
}

export async function GET(_request: Request, ctx: RouteContext<"/api/invitations/[id]/guestbook">) {
  const { id } = await ctx.params;
  if (!(await openGuestbook(id))) return json({ error: "방명록을 찾을 수 없어요." }, 404);
  const entries: GuestbookItem[] = (await store.listGuestbook(id)).map(
    ({ id, name, message, createdAt }) => ({ id, name, message, createdAt }),
  );
  return json({ entries });
}

export async function POST(request: Request, ctx: RouteContext<"/api/invitations/[id]/guestbook">) {
  const { id } = await ctx.params;
  if (!(await openGuestbook(id))) return json({ error: "방명록을 찾을 수 없어요." }, 404);

  const parsed = parseGuestbookInput(await request.json().catch(() => null));
  if ("error" in parsed) return json({ error: parsed.error }, 400);

  const entry = {
    id: shortId(12),
    invitationId: id,
    name: parsed.value.name,
    message: parsed.value.message,
    passwordHash: await hashPassword(parsed.value.password),
    createdAt: new Date().toISOString(),
  };
  await store.insertGuestbook(entry);
  const item: GuestbookItem = {
    id: entry.id,
    name: entry.name,
    message: entry.message,
    createdAt: entry.createdAt,
  };
  return json({ entry: item }, 201);
}
