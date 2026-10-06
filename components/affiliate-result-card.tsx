import {
  ArrowIcon,
  CheckIcon,
  CopyIcon,
  OrderBagIcon,
  ShareIcon,
  ShieldIcon,
} from '@/components/icons';

export type AffiliateResult = {
  affiliateUrl: string;
  provider: 'shopee' | 'tiktok';
  sourceUrl: string;
  productTitle: string;
  commissionRate?: number;
  estimatedCashback?: number;
};

type AffiliateResultCardProps = {
  result: AffiliateResult;
  isCopied: boolean;
  isShared: boolean;
  onCopy: () => void;
  onShare: () => void;
};

const currency = new Intl.NumberFormat('vi-VN');

const purchaseNotes = [
  {
    icon: '🔗',
    title: 'Mỗi link chỉ ghi nhận 1 đơn',
    detail: 'Nếu link đã có đơn, hãy tạo link mới cho lần mua tiếp theo.',
  },
  {
    icon: '🛒',
    title: 'Xóa sản phẩm khỏi giỏ hàng',
    detail: 'Nếu sản phẩm đã có sẵn trong giỏ, hãy xóa trước khi bấm link.',
  },
  {
    icon: '🐢',
    title: 'Thao tác chậm lại khi đặt hàng',
    detail: 'Tránh thao tác quá nhanh để hệ thống có thời gian ghi nhận đơn.',
  },
  {
    icon: '🏷️',
    title: 'Thao tác mua hàng',
    detail: 'Bấm link → tiến hành mua hoặc thêm vào giỏ, hạn chế chuyển trang.',
  },
  {
    icon: '📱',
    title: 'Không xem Live/Video sau khi bấm link',
    detail: 'Hãy hoàn tất đơn hàng trước khi thực hiện các thao tác khác.',
  },
] as const;

function formatRate(value?: number) {
  if (value === undefined) return '—';
  return `${new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function AffiliateResultCard({
  result,
  isCopied,
  isShared,
  onCopy,
  onShare,
}: AffiliateResultCardProps) {
  const providerName = result.provider === 'shopee' ? 'Shopee' : 'TikTok Shop';

  return (
    <section
      className="mt-6 rounded-3xl border-2 border-emerald-500 bg-linear-to-br from-emerald-50/70 via-white to-white p-5 shadow-sm dark:border-emerald-500/70 dark:from-emerald-950/25 dark:via-dark-panel dark:to-dark-panel sm:p-8 lg:p-10"
      aria-labelledby="affiliate-result-title"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-slate-950 dark:text-cloud-dancer">
        <ShieldIcon className="size-8 shrink-0 text-emerald-700 dark:text-emerald-300" />
        <h2
          id="affiliate-result-title"
          className="m-0 text-xl font-extrabold tracking-tight sm:text-3xl"
        >
          Link hoàn tiền của bạn đã sẵn sàng
        </h2>
      </div>

      <p className="mt-7 mb-0 text-sm text-slate-600 leading-relaxed dark:text-slate-300 sm:text-xl">
        {result.productTitle}
      </p>

      <div className="mt-5 flex min-w-0 items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 p-2 shadow-sm dark:border-emerald-400/25 dark:bg-slate-950/40">
        <span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          {result.affiliateUrl}
        </span>
        <button
          className="grid size-10 min-w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-slate-500 shadow-none transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 active:bg-primary/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-primary-dark/20 dark:hover:text-primary-dark dark:focus-visible:ring-primary-dark/30 motion-reduce:transition-none"
          type="button"
          onClick={onCopy}
          aria-label={
            isCopied ? 'Đã sao chép link rút gọn' : 'Sao chép link rút gọn'
          }
        >
          {isCopied ? (
            <CheckIcon className="size-5" />
          ) : (
            <CopyIcon className="size-5" />
          )}
        </button>
      </div>

      {/* <div className="mt-7 flex items-center justify-between gap-5 px-1 sm:mt-9 sm:px-7">
        <div className="flex items-center gap-3 text-base text-slate-600 dark:text-slate-300 sm:text-xl">
          <span className="text-2xl leading-none" aria-hidden="true">
            ↗
          </span>
          <span>Hoa hồng ước tính</span>
        </div>
        <strong className="shrink-0 text-xl text-slate-950 dark:text-white sm:text-3xl">
          {formatRate(result.commissionRate)}
        </strong>
      </div> */}

      {/* <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-5 text-emerald-800 dark:border-emerald-400/70 dark:bg-emerald-400/10 dark:text-emerald-200 sm:px-7">
        <div className="flex min-w-0 items-center gap-3 text-base sm:text-2xl">
          <WalletIcon className="size-7 shrink-0" />
          <span>Ước tính hoàn về bạn</span>
        </div>
        <strong className="shrink-0 text-xl sm:text-3xl">
          {result.estimatedCashback === undefined
            ? 'Đang cập nhật'
            : `${currency.format(Math.round(result.estimatedCashback))}đ`}
        </strong>
      </div> */}

      <a
        className={`mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-3 text-center text-base font-bold text-white no-underline shadow-xl transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-4 motion-reduce:transform-none sm:gap-3 sm:px-5 sm:text-2xl ${
          result.provider === 'shopee'
            ? 'bg-linear-to-r from-orange-600 to-orange-500 shadow-orange-500/20 focus-visible:ring-orange-300'
            : 'bg-slate-950 shadow-slate-950/20 focus-visible:ring-slate-400 dark:bg-[#fe2c55] dark:text-white dark:shadow-[#fe2c55]/20 dark:focus-visible:ring-[#fe2c55]/40'
        }`}
        href={result.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        <OrderBagIcon className="size-7" />
        <span className="whitespace-nowrap">Mua ngay trên {providerName}</span>
        <ArrowIcon className="size-7" />
      </a>

      <p className="mt-7 mb-3 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
        Hãy chia sẻ cho cộng đồng, nếu có người mua bạn sẽ nhận được hoa hồng:
      </p>
      <button
        className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-emerald-100 bg-white/70 px-5 text-base font-bold text-emerald-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 dark:border-emerald-400/20 dark:bg-white/5 dark:text-emerald-300 dark:hover:bg-emerald-400/10 sm:text-xl"
        type="button"
        onClick={onShare}
      >
        {isShared ? (
          <CheckIcon className="size-6" />
        ) : (
          <ShareIcon className="size-6" />
        )}
        {isShared ? 'Đã sao chép link' : 'Chia sẻ deal lên cộng đồng'}
      </button>

      <div className="mt-4 text-slate-500 dark:text-slate-400">
        <h3 className="pl-7 m-0 flex items-center gap-2 text-base font-medium uppercase sm:text-xl">
          {/* <ShieldIcon className="size-6" /> */}
          <span aria-hidden="true">⚠️</span>
          Lưu ý trước khi mua
        </h3>
        <ul className="mt-4 mb-0 space-y-4 pl-7 sm:pl-10">
          {purchaseNotes.map((note) => (
            <li
              className="pl-1 text-sm leading-relaxed sm:text-lg"
              key={note.title}
            >
              <div className="font-medium text-slate-600 dark:text-slate-300">
                <span className="mr-2" aria-hidden="true">
                  {note.icon}
                </span>
                {note.title}
              </div>
              <p className="mt-1 mb-0">{note.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
