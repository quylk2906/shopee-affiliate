export type ProductCategory =
  | 'fashion'
  | 'beauty'
  | 'electronics'
  | 'home'
  | 'sports';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  provider: 'shopee' | 'tiktok';
  price: number;
  originalPrice: number;
  rating: number;
  soldCount: number;
  commissionRate: number;
};

export const categoryLabels: Record<ProductCategory, string> = {
  fashion: 'Thời trang',
  beauty: 'Làm đẹp',
  electronics: 'Điện tử',
  home: 'Nhà cửa',
  sports: 'Thể thao',
};

export const categoryEmoji: Record<ProductCategory, string> = {
  fashion: '👕',
  beauty: '💄',
  electronics: '🎧',
  home: '🪴',
  sports: '👟',
};

const baseProducts: Array<{
  name: string;
  category: ProductCategory;
  price: number;
}> = [
  { name: 'Áo thun cotton oversize', category: 'fashion', price: 129_000 },
  { name: 'Quần jean ống suông', category: 'fashion', price: 289_000 },
  { name: 'Túi tote canvas', category: 'fashion', price: 99_000 },
  { name: 'Áo khoác gió 2 lớp', category: 'fashion', price: 359_000 },
  { name: 'Serum vitamin C 30ml', category: 'beauty', price: 245_000 },
  { name: 'Kem chống nắng SPF50+', category: 'beauty', price: 189_000 },
  { name: 'Son kem lì lâu trôi', category: 'beauty', price: 159_000 },
  {
    name: 'Tai nghe Bluetooth chống ồn',
    category: 'electronics',
    price: 899_000,
  },
  { name: 'Sạc dự phòng 20.000mAh', category: 'electronics', price: 459_000 },
  { name: 'Bàn phím cơ không dây', category: 'electronics', price: 1_250_000 },
  { name: 'Đèn ngủ cảm biến', category: 'home', price: 119_000 },
  { name: 'Bình giữ nhiệt 750ml', category: 'home', price: 215_000 },
  { name: 'Bộ hộp đựng thực phẩm', category: 'home', price: 175_000 },
  { name: 'Giày chạy bộ siêu nhẹ', category: 'sports', price: 749_000 },
  { name: 'Thảm tập yoga 6mm', category: 'sports', price: 239_000 },
  { name: 'Dây kháng lực 5 mức', category: 'sports', price: 145_000 },
];

const variants = ['Tiêu chuẩn', 'Phiên bản Pro', 'Combo 2 món', 'Bản giới hạn'];

// Deterministic pseudo-random so server renders stay stable between requests.
function seeded(seed: number) {
  const value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
}

export const mockProducts: Product[] = variants.flatMap(
  (variant, variantIndex) =>
    baseProducts.map((base, baseIndex) => {
      const index = variantIndex * baseProducts.length + baseIndex;
      const multiplier = 1 + variantIndex * 0.35;
      const price = Math.round((base.price * multiplier) / 1_000) * 1_000;
      const discount = 0.1 + seeded(index) * 0.4;

      return {
        id: `p-${index + 1}`,
        name: `${base.name} – ${variant}`,
        category: base.category,
        provider: seeded(index + 100) > 0.35 ? 'shopee' : 'tiktok',
        price,
        originalPrice: Math.round(price / (1 - discount) / 1_000) * 1_000,
        rating: Math.round((4 + seeded(index + 200)) * 10) / 10,
        soldCount: Math.round(seeded(index + 300) * 12_000) + 20,
        commissionRate: Math.round(3 + seeded(index + 400) * 9),
      };
    }),
);

// Lowercase and strip Vietnamese diacritics so "ao thun" matches "Áo thun".
function searchable(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
}

export function searchProducts(query: string) {
  const terms = searchable(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return mockProducts;

  return mockProducts.filter((product) => {
    const haystack = searchable(
      `${product.name} ${categoryLabels[product.category]}`,
    );
    return terms.every((term) => haystack.includes(term));
  });
}
