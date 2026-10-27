import type { Metadata } from "next";
import { CommissionLinkBuilder } from "@/components/commission-link-builder";

export const metadata: Metadata = {
  title: "Lấy Link — Tạo link hoa hồng Shopee & TikTok",
  description:
    "Tạo link affiliate Shopee và TikTok Shop nhanh chóng, miễn phí và minh bạch.",
};

export default function AffiliatePage() {
  return <CommissionLinkBuilder />;
}
