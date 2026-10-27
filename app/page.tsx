import type { Metadata } from "next";
import { Storefront } from "@/components/storefront";
import { searchProducts } from "@/lib/mock-products";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Cửa hàng — Lấy Link",
  description: "Deal Shopee và TikTok Shop được chọn lọc mỗi ngày.",
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const { page: pageParam, q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const matches = searchProducts(query);
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const requestedPage = Number(
    Array.isArray(pageParam) ? pageParam[0] : pageParam,
  );
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const products = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Storefront
      products={products}
      query={query}
      page={page}
      totalPages={totalPages}
      totalCount={matches.length}
      pageSize={PAGE_SIZE}
    />
  );
}
