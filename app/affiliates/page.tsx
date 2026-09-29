import type { Metadata } from "next";
import { AffiliateOrders } from "@/components/affiliate-orders";

export const metadata: Metadata = {
  title: "Đơn hàng affiliate — Lấy Link",
  description: "Theo dõi đơn hàng và hoa hồng Shopee Affiliate.",
};

export default function AffiliatesPage() {
  return <AffiliateOrders />;
}
