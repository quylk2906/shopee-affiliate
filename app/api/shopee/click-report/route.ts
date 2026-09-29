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
    click_time_s: range.start,
    click_time_e: range.end,
  });

  try {
    return await fetchShopeeAffiliate(`/api/v1/click_report/list?${query}`);
  } catch (error) {
    return shopeeRequestError(error);
  }
}
