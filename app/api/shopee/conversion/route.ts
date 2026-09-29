import {
  defaultReportRange,
  fetchShopeeAffiliate,
  forwardQuery,
  shopeeRequestError,
} from "@/lib/shopee";

export async function GET(request: Request) {
  const range = defaultReportRange();
  const query = forwardQuery(request, {
    page_num: 1,
    page_size: 20,
    purchase_time_s: range.start,
    purchase_time_e: range.end,
    version: 1,
  });

  try {
    return await fetchShopeeAffiliate(`/api/v3/report/list?${query}`);
  } catch (error) {
    return shopeeRequestError(error);
  }
}
