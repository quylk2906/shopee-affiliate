import {
  fetchShopeeAffiliate,
  forwardQuery,
  shopeeRequestError,
} from "@/lib/shopee";

export async function GET(request: Request) {
  const query = forwardQuery(request);
  const itemId = query.get("item_id");

  if (itemId && !/^\d+$/.test(itemId)) {
    return Response.json(
      { error: "item_id must contain digits only." },
      { status: 400 },
    );
  }

  if (!itemId) {
    if (!query.has("page_offset")) query.set("page_offset", "0");
    if (!query.has("page_limit")) query.set("page_limit", "20");
    if (!query.has("client_type")) query.set("client_type", "1");
  }

  const path: `/api/${string}` = itemId
    ? `/api/v3/offer/product?${query}`
    : `/api/v3/offer/product/list?${query}`;

  try {
    return await fetchShopeeAffiliate(path);
  } catch (error) {
    return shopeeRequestError(error);
  }
}
