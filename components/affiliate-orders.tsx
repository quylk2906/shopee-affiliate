'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  OrderBagIcon,
  RefreshIcon,
} from '@/components/icons';

type Status = 'all' | 'pending' | 'completed' | 'cancelled';
type OrderStatus = Exclude<Status, 'all'>;

type AffiliateOrder = {
  id: string;
  title: string;
  purchasedAt: Date | null;
  orderValue: number;
  commissionBeforeTax: number;
  commissionAfterTax: number;
  status: OrderStatus;
};

type ApiResponse = {
  code?: number;
  msg?: string;
  error?: string;
  data?: {
    page_num?: number;
    page_size?: number;
    total_count?: number;
    list?: unknown[] | null;
  };
};

const PAGE_SIZE = 20;
const TAX_FACTOR = 0.89;
const currency = new Intl.NumberFormat('vi-VN');

const filters: Array<{ value: Status; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

function dateInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function initialRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return { start: dateInputValue(start), end: dateInputValue(end) };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstValue(
  sources: Record<string, unknown>[],
  keys: string[],
): unknown {
  for (const source of sources) {
    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null) return source[key];
    }
  }
}

function firstString(
  sources: Record<string, unknown>[],
  keys: string[],
): string {
  const value = firstValue(sources, keys);
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

function firstNumber(
  sources: Record<string, unknown>[],
  keys: string[],
): number {
  const value = firstValue(sources, keys);
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseDate(value: unknown) {
  if (typeof value === 'number') {
    const date = new Date(value < 10_000_000_000 ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'string' && value) {
    const numeric = Number(value);
    const date = Number.isFinite(numeric)
      ? new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric)
      : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function parseStatus(sources: Record<string, unknown>[]): OrderStatus {
  const raw = firstValue(sources, [
    'display_order_status',
    'order_status_text',
    'conversion_status_text',
    'order_status',
    'conversion_status',
    'status',
  ]);
  const normalized = String(raw ?? '').toLowerCase();

  if (/cancel|invalid|refund|reject|hủy/.test(normalized)) return 'cancelled';
  if (/complete|valid|approve|paid|finish|hoàn tất/.test(normalized)) {
    return 'completed';
  }
  if (typeof raw === 'number') {
    if (raw === 1) return 'completed';
    if (raw === 2 || raw === 3) return 'cancelled';
  }
  return 'pending';
}

function normalizeOrders(list: unknown[] | null | undefined): AffiliateOrder[] {
  if (!Array.isArray(list)) return [];
  const rows: AffiliateOrder[] = [];

  list.forEach((conversionValue, conversionIndex) => {
    const conversion = objectValue(conversionValue);
    const ordersValue = conversion.orders ?? conversion.order_list;
    const orders = Array.isArray(ordersValue) ? ordersValue : [conversionValue];

    orders.forEach((orderValue, orderIndex) => {
      const order = objectValue(orderValue);
      const itemsValue = order.items ?? order.item_list ?? order.products;
      const items =
        Array.isArray(itemsValue) && itemsValue.length
          ? itemsValue
          : [orderValue];

      items.forEach((itemValue, itemIndex) => {
        const item = objectValue(itemValue);
        const sources = [item, order, conversion];
        const orderId = firstString(sources, [
          'order_sn',
          'order_id',
          'checkout_id',
          'conversion_id',
        ]);
        const title = firstString(sources, [
          'item_name',
          'product_name',
          'product_title',
          'item_title',
          'name',
        ]);
        const beforeTax = firstNumber(sources, [
          'estimated_commission',
          'gross_commission',
          'commission_before_tax',
          'total_commission',
          'commission',
        ]);
        const afterTax = firstNumber(sources, [
          'actual_commission',
          'net_commission',
          'commission_after_tax',
          'validated_commission',
        ]);

        rows.push({
          id: `${orderId || 'order'}-${conversionIndex}-${orderIndex}-${itemIndex}`,
          title: title || `Đơn hàng Shopee${orderId ? ` #${orderId}` : ''}`,
          purchasedAt: parseDate(
            firstValue(sources, [
              'purchase_time',
              'created_at',
              'order_time',
              'checkout_time',
            ]),
          ),
          orderValue: firstNumber(sources, [
            'purchase_value',
            'order_value',
            'item_price',
            'product_price',
            'amount',
            'sale_amount',
          ]),
          commissionBeforeTax: beforeTax,
          commissionAfterTax: afterTax || Math.round(beforeTax * TAX_FACTOR),
          status: parseStatus(sources),
        });
      });
    });
  });

  return rows;
}

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    : 'Chưa rõ ngày';
}

function formatMoney(value: number) {
  return `${currency.format(Math.round(value))}đ`;
}

function unixAt(date: string, endOfDay = false) {
  return Math.floor(
    new Date(`${date}T${endOfDay ? '23:59:59' : '00:00:00'}`).getTime() / 1000,
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="group relative block min-w-0 flex-1">
      <span className="absolute -top-2.5 left-3 z-10 bg-cloud-dancer px-1 text-sm text-slate-500 transition-colors dark:bg-dark-background dark:text-slate-400 sm:text-base">
        {label}
      </span>
      <span className="flex h-14 items-center rounded-xl border border-slate-300 bg-white px-4 transition-colors group-focus-within:border-primary group-focus-within:ring-4 group-focus-within:ring-primary/10 dark:border-white/15 dark:bg-dark-panel dark:group-focus-within:border-primary-dark">
        <input
          className="h-full min-w-0 flex-1 bg-transparent text-base text-slate-700 outline-none dark:text-slate-200 sm:text-lg"
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
        />
        <CalendarIcon className="pointer-events-none ml-2 hidden size-5 shrink-0 text-slate-500 sm:block" />
      </span>
    </label>
  );
}

function OrderCard({ order }: { order: AffiliateOrder }) {
  const completed = order.status === 'completed';
  const cancelled = order.status === 'cancelled';
  const statusLabel = completed
    ? 'Hoàn tất'
    : cancelled
      ? 'Đã hủy'
      : 'Đang chờ';

  return (
    <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.025] dark:border-white/10 dark:bg-dark-panel sm:grid-cols-[64px_minmax(0,1fr)_150px] sm:items-center sm:p-6">
      <div className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-primary dark:bg-primary/20 dark:text-emerald-300 sm:size-16">
        <OrderBagIcon className="size-7" />
      </div>

      <div className="min-w-0">
        <h2 className="m-0 line-clamp-2 font-bold text-base text-slate-900 leading-snug dark:text-slate-100 sm:text-lg">
          {order.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          {formatDate(order.purchasedAt)}
          <span aria-hidden="true"> · </span>
          <span className="break-all">
            #{order.id.split('-').slice(0, -3).join('-')}
          </span>
          <span aria-hidden="true"> · </span>
          <u>{formatMoney(order.orderValue)}</u>
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Hoa hồng trước thuế, phí:{' '}
          <strong className="font-semibold text-slate-600 dark:text-slate-300">
            <u>{formatMoney(order.commissionBeforeTax)}</u>
          </strong>{' '}
          <span aria-hidden="true">→</span> sau thuế, phí:{' '}
          <strong className="font-semibold text-slate-600 dark:text-slate-300">
            <u>{formatMoney(order.commissionAfterTax)}</u>
          </strong>
        </p>
      </div>

      <div className="flex items-end justify-between gap-3 sm:flex-col sm:justify-center sm:text-right">
        <strong
          className={`text-xl ${
            cancelled
              ? 'text-rose-500'
              : completed
                ? 'text-primary dark:text-emerald-300'
                : 'text-orange-500'
          }`}
        >
          {completed ? '+' : cancelled ? '' : '~'}
          <u>{formatMoney(order.commissionAfterTax)}</u>
        </strong>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-medium sm:text-base ${
            cancelled
              ? 'border-rose-400 text-rose-500'
              : completed
                ? 'border-emerald-600 text-primary dark:border-emerald-300 dark:text-emerald-300'
                : 'border-orange-400 text-orange-500'
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </article>
  );
}

export function AffiliateOrders() {
  const range = useMemo(initialRange, []);
  const [startDate, setStartDate] = useState(range.start);
  const [endDate, setEndDate] = useState(range.end);
  const [status, setStatus] = useState<Status>('all');
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<AffiliateOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) {
      setError('Ngày bắt đầu phải trước ngày kết thúc.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      page_num: String(page),
      page_size: String(PAGE_SIZE),
      purchase_time_s: String(unixAt(startDate)),
      purchase_time_e: String(unixAt(endDate, true)),
    });
    setLoading(true);
    setError('');

    fetch(`/api/shopee/conversion?${params}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'X-Client-Request': String(reloadKey) },
    })
      .then(async (response) => {
        const payload = (await response.json()) as ApiResponse;
        if (!response.ok || payload.code !== 0) {
          throw new Error(
            payload.error ||
              payload.msg ||
              'Không thể tải danh sách đơn hàng từ Shopee.',
          );
        }
        setOrders(normalizeOrders(payload.data?.list));
        setTotalCount(payload.data?.total_count ?? 0);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return;
        }
        setOrders([]);
        setTotalCount(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Không thể tải danh sách đơn hàng từ Shopee.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [endDate, page, reloadKey, startDate]);

  const visibleOrders =
    status === 'all'
      ? orders
      : orders.filter((order) => order.status === status);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function changeRange(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <main className="min-h-dvh bg-cloud-dancer px-4 py-7 dark:bg-dark-background sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 border-slate-300 border-b dark:border-white/10">
          <nav
            className="flex min-w-0 gap-3 sm:gap-8"
            aria-label="Báo cáo affiliate"
          >
            <span className="flex h-14 items-center gap-2 border-primary border-b-3 px-1 font-bold text-primary sm:h-16 sm:px-5 sm:text-xl">
              <OrderBagIcon className="size-6" />
              Đơn hàng
            </span>
            <button
              className="flex h-14 cursor-not-allowed items-center gap-2 px-1 font-semibold text-slate-500 opacity-70 sm:h-16 sm:px-5 sm:text-xl"
              type="button"
              disabled
              title="Sắp ra mắt"
            >
              <HistoryIcon className="size-6" />
              <span className="hidden sm:inline">Lịch sử chi trả</span>
              <span className="sm:hidden">Chi trả</span>
            </button>
          </nav>
          <Link
            className="shrink-0 rounded-xl px-3 py-2 font-semibold text-primary no-underline transition-colors hover:bg-primary/5 dark:text-emerald-300 dark:hover:bg-emerald-300/10"
            href="/"
          >
            Tạo link
          </Link>
        </div>

        <section className="mt-8 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <fieldset className="flex flex-wrap gap-1.5 sm:gap-2">
            <legend className="sr-only">Lọc theo trạng thái</legend>
            {filters.map((filter) => (
              <button
                className={`rounded-full border px-4 py-1 font-medium transition-colors sm:px-4 sm:text-base ${
                  status === filter.value
                    ? 'border-primary bg-primary text-white dark:border-primary-dark dark:bg-primary-dark'
                    : 'border-slate-300 bg-transparent text-slate-700 hover:border-primary hover:text-primary dark:border-white/15 dark:text-slate-300 dark:hover:border-primary-dark dark:hover:text-primary-dark'
                }`}
                type="button"
                key={filter.value}
                aria-pressed={status === filter.value}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </fieldset>

          <div className="flex w-full gap-3 lg:w-auto lg:min-w-xl">
            <DateField
              label="Từ ngày"
              value={startDate}
              onChange={(value) => changeRange(setStartDate, value)}
            />
            <DateField
              label="Đến ngày"
              value={endDate}
              onChange={(value) => changeRange(setEndDate, value)}
            />
          </div>
        </section>

        <section className="mt-6" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-dark-panel">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <RefreshIcon className="mx-auto mb-3 size-8 animate-spin text-primary dark:text-emerald-300 motion-reduce:animate-none" />
                Đang tải đơn hàng…
              </div>
            </div>
          ) : error ? (
            <div className="grid min-h-72 place-items-center rounded-3xl border border-rose-200 bg-white p-8 text-center dark:border-rose-400/20 dark:bg-dark-panel">
              <div>
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                  <span className="text-2xl">!</span>
                </div>
                <h1 className="mt-4 font-bold text-xl text-slate-900 dark:text-slate-100">
                  Chưa tải được đơn hàng
                </h1>
                <p className="mt-2 max-w-lg text-slate-500 dark:text-slate-400">
                  {error}
                </p>
                <button
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white hover:opacity-90 dark:bg-primary-dark"
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  <RefreshIcon className="size-4" />
                  Thử lại
                </button>
              </div>
            </div>
          ) : visibleOrders.length ? (
            <div className="space-y-4">
              {visibleOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-dark-panel">
              <div>
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-primary dark:bg-primary/20 dark:text-emerald-300">
                  <OrderBagIcon className="size-8" />
                </div>
                <h1 className="mt-4 font-bold text-xl text-slate-900 dark:text-slate-100">
                  Chưa có đơn hàng
                </h1>
                <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
                  Không tìm thấy đơn hàng phù hợp với trạng thái và khoảng ngày
                  đã chọn.
                </p>
              </div>
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <nav
            className="mt-6 flex items-center justify-center gap-3"
            aria-label="Phân trang"
          >
            <button
              className="grid size-10 place-items-center rounded-xl border border-slate-300 text-slate-600 disabled:opacity-40 dark:border-white/15 dark:text-slate-300"
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Trang {page} / {totalPages}
            </span>
            <button
              className="grid size-10 place-items-center rounded-xl border border-slate-300 text-slate-600 disabled:opacity-40 dark:border-white/15 dark:text-slate-300"
              type="button"
              disabled={page === totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              aria-label="Trang sau"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
