import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClearIcon,
  SearchIcon,
} from '@/components/icons';
import {
  categoryEmoji,
  categoryLabels,
  type Product,
} from '@/lib/mock-products';

const currency = new Intl.NumberFormat('vi-VN');
const compact = new Intl.NumberFormat('vi-VN', { notation: 'compact' });

const categoryTint: Record<Product['category'], string> = {
  fashion:
    'from-sky-100 to-indigo-100 dark:from-sky-500/15 dark:to-indigo-500/15',
  beauty: 'from-rose-100 to-pink-100 dark:from-rose-500/15 dark:to-pink-500/15',
  electronics:
    'from-slate-100 to-zinc-200 dark:from-slate-500/15 dark:to-zinc-500/15',
  home: 'from-emerald-100 to-lime-100 dark:from-emerald-500/15 dark:to-lime-500/15',
  sports:
    'from-amber-100 to-orange-100 dark:from-amber-500/15 dark:to-orange-500/15',
};

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  const search = params.toString();
  return search ? `/?${search}` : '/';
}

// Always shows the first, last and current pages with one neighbour each side.
function pageItems(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1
      ? (['gap', page] as const)
      : [page],
  );
}

function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100,
  );

  return (
    <li className="group flex flex-col overflow-hidden rounded-3xl border border-stone-300/80 bg-white/80 shadow-sm transition-shadow hover:shadow-lg hover:shadow-stone-900/5 dark:border-white/10 dark:bg-dark-panel dark:hover:shadow-black/30 motion-reduce:transition-none">
      <div
        className={`relative grid aspect-square place-items-center bg-linear-to-br ${categoryTint[product.category]}`}
      >
        <span
          className="text-6xl transition-transform group-hover:scale-110 motion-reduce:transition-none sm:text-7xl"
          aria-hidden="true"
        >
          {categoryEmoji[product.category]}
        </span>
        <span className="absolute top-3 left-3 rounded-full bg-rose-600 px-2.5 py-0.5 font-bold text-white text-xs">
          -{discount}%
        </span>
        <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 shadow-sm dark:bg-dark-background/80">
          <Image
            className="h-4.5 w-auto"
            src={
              product.provider === 'shopee'
                ? '/icons/shopee-icon.svg'
                : '/icons/tiktok-icon.svg'
            }
            alt={product.provider === 'shopee' ? 'Shopee' : 'TikTok Shop'}
            width={18}
            height={18}
            unoptimized
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="m-0 font-semibold text-primary text-xs uppercase tracking-wide dark:text-primary-dark">
          {categoryLabels[product.category]}
        </p>
        <h2 className="mt-1 mb-0 line-clamp-2 min-h-11 font-semibold text-base text-slate-900 leading-snug dark:text-cloud-dancer">
          {product.name}
        </h2>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <strong className="text-lg text-rose-600 dark:text-rose-400">
            {currency.format(product.price)}₫
          </strong>
          <s className="text-slate-400 text-sm dark:text-slate-500">
            {currency.format(product.originalPrice)}₫
          </s>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-slate-500 text-sm dark:text-slate-400">
          <span>
            <span className="text-amber-500" aria-hidden="true">
              ★
            </span>{' '}
            {product.rating.toFixed(1)}
            <span className="sr-only"> trên 5 sao</span>
          </span>
          <span>Đã bán {compact.format(product.soldCount)}</span>
        </div>

        <p className="mt-auto mb-0 pt-4">
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs dark:bg-primary-dark/20 dark:text-primary-dark">
            Hoa hồng {product.commissionRate}%
          </span>
        </p>
      </div>
    </li>
  );
}

function SearchBar({ query }: { query: string }) {
  return (
    <Form
      className="mt-6 flex max-w-2xl gap-2 sm:gap-3"
      action="/"
      role="search"
      aria-label="Tìm sản phẩm"
    >
      <div className="relative flex h-14 min-w-0 flex-1 items-center rounded-2xl border border-slate-300 bg-white transition-shadow focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 dark:border-white/10 dark:bg-slate-950/70 dark:focus-within:border-primary-dark dark:focus-within:ring-primary-dark/30 motion-reduce:transition-none">
        <SearchIcon
          className="pointer-events-none ml-4 size-5 shrink-0 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
        <label className="sr-only" htmlFor="store-search">
          Tìm sản phẩm
        </label>
        <input
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-slate-800 outline-0 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
          id="store-search"
          // Remount on navigation so the field mirrors the URL query.
          key={query}
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Tìm áo thun, tai nghe, kem chống nắng…"
          defaultValue={query}
        />
        {query ? (
          <Link
            className="mr-2 grid size-10 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-primary/5 hover:text-primary dark:text-slate-400 dark:hover:bg-primary-dark/20 dark:hover:text-primary-dark motion-reduce:transition-none"
            href="/"
            aria-label="Xóa tìm kiếm"
          >
            <ClearIcon className="size-5" />
          </Link>
        ) : null}
      </div>
      <button
        className="shrink-0 cursor-pointer rounded-2xl bg-primary px-5 font-semibold text-cloud-dancer shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-primary/20 dark:bg-primary-dark dark:shadow-primary-dark/20 motion-reduce:transition-none sm:px-7"
        type="submit"
      >
        Tìm
      </button>
    </Form>
  );
}

function Pagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: string;
}) {
  const stepClass =
    'grid size-10 place-items-center rounded-xl border border-slate-300 text-slate-600 no-underline transition-colors hover:border-primary hover:text-primary dark:border-white/15 dark:text-slate-300 dark:hover:border-primary-dark dark:hover:text-primary-dark motion-reduce:transition-none';
  const disabledClass =
    'grid size-10 place-items-center rounded-xl border border-slate-300 text-slate-600 opacity-40 dark:border-white/15 dark:text-slate-300';

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Phân trang"
    >
      {page > 1 ? (
        <Link
          className={stepClass}
          href={pageHref(page - 1, query)}
          aria-label="Trang trước"
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          <ChevronLeftIcon className="size-5" />
        </span>
      )}

      {pageItems(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span
            className="px-1 text-slate-400 dark:text-slate-500"
            // biome-ignore lint/suspicious/noArrayIndexKey: gaps have no identity
            key={`gap-${index}`}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            className={
              item === page
                ? 'grid size-10 place-items-center rounded-xl border border-primary bg-primary font-semibold text-white no-underline dark:border-primary-dark dark:bg-primary-dark'
                : `${stepClass} font-medium`
            }
            href={pageHref(item, query)}
            key={item}
            aria-label={`Trang ${item}`}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          className={stepClass}
          href={pageHref(page + 1, query)}
          aria-label="Trang sau"
        >
          <ChevronRightIcon className="size-5" />
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          <ChevronRightIcon className="size-5" />
        </span>
      )}
    </nav>
  );
}

export function Storefront({
  products,
  query,
  page,
  totalPages,
  totalCount,
  pageSize,
}: {
  products: Product[];
  query: string;
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}) {
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = firstItem + products.length - 1;

  return (
    <div className="min-h-dvh bg-cloud-dancer dark:bg-dark-background">
      <header className="h-20 border-stone-300/70 border-b bg-cloud-dancer/90 shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-dark-background/90 dark:shadow-black/20">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            className="flex items-center gap-3 text-primary no-underline dark:text-primary-dark"
            href="/"
            aria-label="Lấy Link - Trang chủ"
          >
            <Image
              className="size-10 shrink-0 rounded-xl bg-cloud-dancer p-0.5 shadow-sm ring-1 ring-stone-300/60 dark:ring-slate-700"
              src="/app-icon.svg"
              alt=""
              width={40}
              height={40}
              unoptimized
            />
            <span className="flex flex-col leading-tight">
              <strong className="text-xl tracking-tight dark:text-cloud-dancer sm:text-2xl">
                Cửa hàng
              </strong>
              <small className="hidden font-medium text-slate-500 text-xs dark:text-slate-400 sm:block sm:text-sm">
                Deal Shopee &amp; TikTok
              </small>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Chính">
            <Link
              className="rounded-xl px-3 py-2 font-semibold text-primary no-underline transition-colors hover:bg-primary/5 dark:text-primary-dark dark:hover:bg-primary-dark/15 motion-reduce:transition-none"
              href="/affiliate"
            >
              Tạo link
            </Link>
            <Link
              className="rounded-xl px-3 py-2 font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-950/5 dark:text-slate-300 dark:hover:bg-white/5 motion-reduce:transition-none"
              href="/affiliates"
            >
              Đơn hàng
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-8 sm:pt-14">
        <section aria-labelledby="store-title">
          <h1
            id="store-title"
            className="m-0 font-extrabold text-3xl text-slate-950 tracking-tight dark:text-cloud-dancer sm:text-5xl"
          >
            Deal{' '}
            <span className="text-primary dark:text-primary-dark">hot</span> hôm
            nay
          </h1>
          <SearchBar query={query} />
          <p
            className="mt-4 mb-0 text-slate-600 dark:text-slate-400 sm:text-lg"
            aria-live="polite"
          >
            {totalCount ? (
              <>
                Hiển thị {firstItem}–{lastItem} trên {totalCount} sản phẩm
                {query ? (
                  <>
                    {' '}
                    cho “
                    <strong className="text-slate-900 dark:text-cloud-dancer">
                      {query}
                    </strong>
                    ”
                  </>
                ) : null}
              </>
            ) : (
              'Không có kết quả'
            )}
          </p>
        </section>

        {products.length ? (
          <ul className="mt-8 grid list-none grid-cols-2 gap-3 p-0 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        ) : (
          <div className="mt-8 grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-dark-panel">
            <div>
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-primary dark:bg-primary/20 dark:text-primary-dark">
                <SearchIcon className="size-8" />
              </div>
              <h2 className="mt-4 mb-0 font-bold text-slate-900 text-xl dark:text-slate-100">
                Không tìm thấy sản phẩm
              </h2>
              <p className="mx-auto mt-2 max-w-md text-slate-500 dark:text-slate-400">
                Không có sản phẩm nào khớp với “{query}”. Thử từ khóa khác hoặc
                xem tất cả deal.
              </p>
              <Link
                className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2.5 font-semibold text-white no-underline hover:opacity-90 dark:bg-primary-dark"
                href="/"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </div>
        )}

        {totalPages > 1 ? (
          <Pagination page={page} totalPages={totalPages} query={query} />
        ) : null}
      </main>
    </div>
  );
}
