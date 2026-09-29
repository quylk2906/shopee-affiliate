import { createShopeeCustomLinks, shopeeRequestError } from "@/lib/shopee";

type CustomLinkPayload = {
  links?: unknown;
  productUrl?: unknown;
  subIds?: unknown;
};

export async function POST(request: Request) {
  let payload: CustomLinkPayload;
  try {
    payload = (await request.json()) as CustomLinkPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const candidates = Array.isArray(payload.links)
    ? payload.links
    : payload.productUrl
      ? [payload.productUrl]
      : [];
  const links = candidates
    .filter((link): link is string => typeof link === "string")
    .map((link) => link.trim())
    .filter((link) => link.length > 0 && link.length <= 2048)
    .slice(0, 50);
  const subIds = Array.isArray(payload.subIds)
    ? payload.subIds
        .filter((subId): subId is string => typeof subId === "string")
        .map((subId) => subId.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  if (links.length === 0) {
    return Response.json(
      { error: "Provide productUrl or a non-empty links array." },
      { status: 400 },
    );
  }

  try {
    return await createShopeeCustomLinks(links, subIds);
  } catch (error) {
    return shopeeRequestError(error);
  }
}
