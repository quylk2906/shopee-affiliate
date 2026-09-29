'use client';

import {
  Alert,
  Button,
  Card,
  Chip,
  Form,
  Link as HeroLink,
  InputGroup,
  Label,
  Spinner,
  TextField,
} from '@heroui/react';
import Image from 'next/image';
import { type FormEvent, useEffect, useState } from 'react';
import {
  type AffiliateResult,
  AffiliateResultCard,
} from '@/components/affiliate-result-card';
import {
  ArrowIcon,
  BoltIcon,
  ClearIcon,
  ClipboardIcon,
  ErrorIcon,
  GiftIcon,
  LinkIcon,
  MoonIcon,
  OrderBagIcon,
  ShieldIcon,
  SunIcon,
  WifiIcon,
} from '@/components/icons';
import { PwaRegistration } from '@/components/pwa-registration';
import { THEME_STORAGE_KEY, type ThemePreference } from '@/lib/theme';
import { mockTikTokData } from './mock-data';

type GeneratedLinkResponse = {
  affiliateUrl: string;
  provider: 'shopee' | 'tiktok';
};

type ProductInsight = {
  productTitle?: string;
  commissionRate?: number;
  estimatedCashback?: number;
};

const benefits = [
  { label: 'Hoa hồng minh bạch', Icon: ShieldIcon },
  { label: 'Không cần cài app', Icon: BoltIcon },
  { label: 'Miễn phí 100%', Icon: GiftIcon },
];

function isSupportedUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      host === 'shopee.vn' ||
      host.endsWith('.shopee.vn') ||
      host === 'tiktok.com' ||
      host.endsWith('.tiktok.com')
    );
  } catch {
    return false;
  }
}

function productTitleFromUrl(value: string) {
  try {
    const { pathname } = new URL(value);
    const slug = decodeURIComponent(pathname)
      .replace(/^\/+/, '')
      .replace(/-i\.\d+\.\d+.*$/, '')
      .replace(/\/product\/\d+\/\d+.*$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return slug || 'Sản phẩm affiliate';
  } catch {
    return 'Sản phẩm affiliate';
  }
}

function shopeeItemId(value: string) {
  try {
    const url = new URL(value);
    const pathMatch = url.pathname.match(/(?:-i\.|\/product\/)\d+[./](\d+)/);
    return pathMatch?.[1] ?? url.searchParams.get('itemid');
  } catch {
    return null;
  }
}

function finiteNumber(value: unknown) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.replace(/[^0-9.-]/g, ''))
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readProductInsight(payload: unknown): ProductInsight {
  const queue: unknown[] = [payload];
  let visited = 0;
  let title: string | undefined;
  let price: number | undefined;
  let rate: number | undefined;
  let cashback: number | undefined;

  while (queue.length && visited < 200) {
    const current = queue.shift();
    visited += 1;
    if (!current || typeof current !== 'object') continue;
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    const record = current as Record<string, unknown>;
    const titleValue =
      record.product_name ??
      record.item_name ??
      record.product_title ??
      record.name;
    if (!title && typeof titleValue === 'string') title = titleValue;

    price ??= finiteNumber(
      record.price ??
        record.price_min ??
        record.product_price ??
        record.sale_price,
    );
    rate ??= finiteNumber(
      record.commission_rate ??
        record.commissionRate ??
        record.commission_rate_percentage,
    );
    cashback ??= finiteNumber(
      record.estimated_commission ??
        record.estimated_cashback ??
        record.estimatedCommission,
    );
    queue.push(...Object.values(record));
  }

  if (rate !== undefined && rate <= 1) rate *= 100;
  if (price !== undefined && price > 1_000_000_000) price /= 100_000;
  if (cashback !== undefined && cashback > 1_000_000_000) cashback /= 100_000;
  if (cashback === undefined && price !== undefined && rate !== undefined) {
    cashback = (price * rate) / 100;
  }

  return {
    productTitle: title,
    commissionRate: rate,
    estimatedCashback: cashback,
  };
}

export function CommissionLinkBuilder() {
  const [productUrl, setProductUrl] = useState('');
  const [result, setResult] = useState<AffiliateResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const storedDarkMode = storedTheme === 'dark';
      setIsDarkMode(storedDarkMode);
      document.documentElement.classList.toggle('dark', storedDarkMode);
    } catch {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  function toggleTheme() {
    const nextDarkMode = !isDarkMode;
    const nextTheme: ThemePreference = nextDarkMode ? 'dark' : 'light';

    setIsDarkMode(nextDarkMode);
    document.documentElement.classList.toggle('dark', nextDarkMode);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The visual toggle still works when storage is unavailable.
    }
  }

  async function pasteFromClipboard() {
    setError('');
    try {
      setProductUrl((await navigator.clipboard.readText()).trim());
    } catch {
      setError(
        'Trình duyệt chưa cho phép đọc bộ nhớ tạm. Hãy dán link thủ công.',
      );
    }
  }

  function clearProductUrl() {
    setProductUrl('');
    setError('');
    setResult(null);
    setIsShared(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResult(null);
    setIsShared(false);
    const normalizedUrl = productUrl.trim();
    if (!isSupportedUrl(normalizedUrl)) {
      setError('Vui lòng nhập link sản phẩm Shopee hoặc TikTok Shop hợp lệ.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/affiliate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUrl: normalizedUrl }),
      });
      const data = (await response.json()) as GeneratedLinkResponse & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          data.error || 'Không thể tạo link lúc này. Vui lòng thử lại.',
        );
      const nextResult: AffiliateResult = {
        ...data,
        sourceUrl: normalizedUrl,
        productTitle: productTitleFromUrl(normalizedUrl),
      };
      setResult(nextResult);

      if (data.provider === 'shopee') {
        const itemId = shopeeItemId(normalizedUrl);
        if (itemId) {
          fetch(`/api/shopee/product?item_id=${encodeURIComponent(itemId)}`, {
            cache: 'no-store',
          })
            .then(async (productResponse) => {
              if (!productResponse.ok) return null;
              return readProductInsight(await productResponse.json());
            })
            .then((insight) => {
              if (!insight) return;
              setResult((current) =>
                current?.sourceUrl === normalizedUrl
                  ? { ...current, ...insight }
                  : current,
              );
            })
            .catch(() => {
              // The generated link remains usable when Shopee hides metadata.
            });
        }
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể tạo link lúc này. Vui lòng thử lại.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function shareResult() {
    if (!result) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: result.productTitle,
          text: 'Mua sản phẩm qua link hoàn tiền này:',
          url: result.affiliateUrl,
        });
      } else {
        await navigator.clipboard.writeText(result.affiliateUrl);
      }
      setIsShared(true);
    } catch (shareError) {
      if (
        shareError instanceof DOMException &&
        shareError.name === 'AbortError'
      ) {
        return;
      }
      try {
        await navigator.clipboard.writeText(result.affiliateUrl);
        setIsShared(true);
      } catch {
        setError(
          'Không thể chia sẻ tự động. Hãy mở link và sao chép thủ công.',
        );
      }
    }
  }

  return (
    <div className="relative isolate min-h-dvh bg-cloud-dancer dark:bg-dark-background">
      <PwaRegistration />

      <header className="relative z-10 h-20 border-stone-300/70 border-b bg-cloud-dancer/90 shadow-xs backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-dark-background/90 dark:shadow-black/20 motion-reduce:transition-none">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <HeroLink
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
                Affiliate
              </strong>
              <small className="hidden text-slate-500 text-xs font-medium dark:text-slate-400 sm:block sm:text-sm">
                Shopee &amp; TikTok
              </small>
            </span>
          </HeroLink>

          <nav
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Nền tảng được hỗ trợ"
          >
            <Chip
              aria-label="Shopee"
              className="inline-flex h-10 items-center gap-2 rounded-xl border-0 bg-transparent px-2.5 font-bold text-orange-600 shadow-none transition-colors hover:bg-orange-500/5 dark:bg-transparent dark:text-orange-400 dark:hover:bg-orange-500/10 motion-reduce:transition-none sm:h-11 sm:px-4"
              size="lg"
              variant="secondary"
            >
              <span
                className="grid size-6 place-items-center"
                aria-hidden="true"
              >
                <Image
                  className="size-6"
                  src="/icons/shopee-icon.svg"
                  alt=""
                  width={24}
                  height={24}
                  unoptimized
                />
              </span>
              <span className="hidden sm:inline">Shopee</span>
            </Chip>
            <Chip
              aria-label="TikTok"
              className="inline-flex h-10 items-center gap-2 rounded-xl border-0 bg-transparent px-2.5 font-bold text-slate-950 shadow-none transition-colors hover:bg-slate-950/5 dark:bg-transparent dark:text-white dark:hover:bg-white/5 motion-reduce:transition-none sm:h-11 sm:px-4"
              size="lg"
              variant="secondary"
            >
              <span
                className="grid size-6 place-items-center"
                aria-hidden="true"
              >
                <Image
                  className="h-6 w-auto"
                  src="/icons/tiktok-icon.svg"
                  alt=""
                  width={21}
                  height={24}
                  unoptimized
                />
              </span>
              <span className="hidden sm:inline">TikTok</span>
            </Chip>
            <Button
              className="grid size-10 min-w-10 cursor-pointer place-items-center rounded-xl border-0 bg-transparent p-0 text-primary shadow-none transition-colors hover:bg-primary/5 focus-visible:ring-4 focus-visible:ring-primary/20 dark:bg-transparent dark:text-primary-dark dark:hover:bg-primary-dark/15 dark:focus-visible:ring-primary-dark/40 motion-reduce:transition-none sm:size-11"
              type="button"
              variant="secondary"
              aria-label={
                isDarkMode
                  ? 'Chuyển sang giao diện sáng'
                  : 'Chuyển sang giao diện tối'
              }
              aria-pressed={isDarkMode}
              onPress={toggleTheme}
            >
              {isDarkMode ? (
                <SunIcon className="size-5" />
              ) : (
                <MoonIcon className="size-5" />
              )}
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-3 pt-12 pb-8 sm:px-8 sm:pt-16">
        <section className="text-center" aria-labelledby="page-title">
          <h1
            id="page-title"
            className="m-0 font-extrabold text-4xl text-slate-950 tracking-tight dark:text-cloud-dancer sm:text-5xl lg:text-6xl"
          >
            Tạo link{' '}
            <span className="text-primary dark:text-primary-dark">
              hoa hồng
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 leading-relaxed dark:text-slate-400 sm:mt-5 sm:text-xl">
            Dán link sản phẩm Shopee hoặc TikTok Shop. Chúng tôi sẽ tạo link
            affiliate sẵn sàng để bạn chia sẻ.
          </p>
          {/* <ul
            className="mx-auto mt-8 mb-10 grid max-w-3xl list-none gap-4 p-0 sm:grid-cols-3 sm:divide-x sm:divide-slate-200 sm:gap-0 dark:sm:divide-slate-800"
            aria-label="Lợi ích"
          >
            {benefits.map(({ label, Icon }) => (
              <li
                className="flex items-center justify-center gap-3 font-semibold text-slate-700 dark:text-slate-300"
                key={label}
              >
                <Icon className="size-7 shrink-0 stroke-2 text-primary dark:text-primary-dark" />
                <span>{label}</span>
              </li>
            ))}
          </ul> */}
        </section>

        <Card
          className="mt-4 relative overflow-visible rounded-3xl border border-stone-300 border-t-2 border-t-primary bg-white/80 p-5 shadow-xl shadow-stone-900/5 backdrop-blur-xl transition-colors dark:border-primary-dark/30 dark:border-t-primary-dark dark:bg-dark-panel dark:shadow-2xl dark:shadow-black/30 motion-reduce:transition-none sm:p-8"
          variant="default"
        >
          <span className="absolute -top-5 left-6 grid size-10 place-items-center rounded-full border-4 border-cloud-dancer bg-primary text-cloud-dancer shadow-md dark:border-slate-950 dark:bg-primary-dark sm:left-8">
            <LinkIcon className="size-5" />
          </span>

          <Card.Content className="block p-0">
            <Form
              className="block pt-3"
              onSubmit={submit}
              validationBehavior="aria"
              aria-label="Tạo link hoa hồng"
            >
              <TextField
                className="w-full"
                fullWidth
                name="productUrl"
                variant="secondary"
              >
                <Label className="mb-3 block font-bold text-base text-slate-950 dark:text-cloud-dancer sm:text-lg">
                  Dán link sản phẩm
                </Label>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <InputGroup
                    className="relative flex h-16 min-w-0 flex-1 items-center rounded-2xl border border-slate-300 bg-white transition-shadow duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 dark:border-white/10 dark:bg-slate-950/70 dark:focus-within:border-primary-dark dark:focus-within:ring-primary-dark/30 motion-reduce:transition-none"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Input
                      className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-slate-800 outline-0 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 sm:px-4 sm:text-lg"
                      id="product-url"
                      type="url"
                      inputMode="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="Dán link sản phẩm Shopee/TikTok"
                      value={productUrl}
                      onChange={(event) => setProductUrl(event.target.value)}
                      aria-describedby="form-note form-error"
                      aria-invalid={Boolean(error)}
                    />
                    <InputGroup.Suffix className="h-full p-0">
                      <Button
                        className="mr-2 grid size-10 min-w-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-slate-500 shadow-none transition-colors hover:bg-primary/5 hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/10 active:bg-primary/10 dark:bg-transparent dark:text-slate-400 dark:hover:bg-primary-dark/20 dark:hover:text-primary-dark dark:focus-visible:ring-primary-dark/30 motion-reduce:transition-none"
                        type="button"
                        variant="secondary"
                        size="lg"
                        aria-label={
                          productUrl ? 'Xóa link sản phẩm' : 'Dán từ bộ nhớ tạm'
                        }
                        onPress={
                          productUrl ? clearProductUrl : pasteFromClipboard
                        }
                      >
                        {productUrl ? (
                          <ClearIcon className="size-5" />
                        ) : (
                          <ClipboardIcon className="size-5" />
                        )}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>

                  <Button
                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-0 bg-primary py-5.5 text-base text-cloud-dancer shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-wait disabled:opacity-75 aria-disabled:cursor-wait aria-disabled:opacity-75 dark:bg-[#25f4ee] dark:text-slate-950 dark:shadow-[#25f4ee]/20 dark:focus-visible:ring-[#25f4ee]/40 motion-reduce:transition-none lg:w-auto"
                    type="submit"
                    variant="primary"
                    isDisabled={isLoading}
                    isPending={isLoading}
                  >
                    <span>
                      {isLoading ? 'Đang tạo link...' : 'Tạo link hoa hồng'}
                    </span>
                    {isLoading ? (
                      <Spinner
                        className="size-5 text-white dark:text-slate-950"
                        size="sm"
                      />
                    ) : (
                      <ArrowIcon className="size-6" />
                    )}
                  </Button>
                </div>
              </TextField>

              <p
                id="form-note"
                className="mt-5 mb-0 text-center text-slate-500 text-sm dark:text-slate-400 lg:text-left"
              >
                Hỗ trợ liên kết sản phẩm từ Shopee và TikTok Shop
              </p>
              {error ? (
                <div id="form-error" className="min-h-8">
                  <Alert
                    className="mt-3 flex min-h-0 items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                    status="danger"
                    role="alert"
                    aria-live="assertive"
                  >
                    <Alert.Indicator className="grid size-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">
                      <ErrorIcon className="size-5" />
                    </Alert.Indicator>
                    <Alert.Content className="min-w-0 flex-1">
                      <Alert.Description className="font-semibold text-sm leading-relaxed">
                        {error}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                </div>
              ) : null}
            </Form>
          </Card.Content>
        </Card>

        {result ? (
          <AffiliateResultCard
            result={result}
            isShared={isShared}
            onShare={shareResult}
          />
        ) : null}

        {/* <div className="mt-8 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
          <Separator className="h-px w-12 bg-slate-200 dark:bg-slate-800 sm:w-32" />
          <WifiIcon className="size-5" />
          <p className="m-0 text-sm">Dùng được khi mất mạng</p>
          <Separator className="h-px w-12 bg-slate-200 dark:bg-slate-800 sm:w-32" />
        </div> */}
      </main>
    </div>
  );
}
