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
  Separator,
  Spinner,
  TextField,
} from '@heroui/react';
import Image from 'next/image';
import { type FormEvent, useState } from 'react';
import {
  ArrowIcon,
  BoltIcon,
  CheckIcon,
  ClearIcon,
  ClipboardIcon,
  CopyIcon,
  ErrorIcon,
  GiftIcon,
  LinkIcon,
  MoonIcon,
  ShieldIcon,
  SunIcon,
  WifiIcon,
} from '@/components/icons';
import { PwaRegistration } from '@/components/pwa-registration';

type GeneratedLink = { affiliateUrl: string; provider: 'shopee' | 'tiktok' };

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

export function CommissionLinkBuilder() {
  const [productUrl, setProductUrl] = useState('');
  const [result, setResult] = useState<GeneratedLink | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    setIsCopied(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResult(null);
    setIsCopied(false);
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
      const data = (await response.json()) as GeneratedLink & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          data.error || 'Không thể tạo link lúc này. Vui lòng thử lại.',
        );
      setResult(data);
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

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.affiliateUrl);
      setIsCopied(true);
    } catch {
      setError(
        'Không thể sao chép tự động. Hãy chọn và sao chép link thủ công.',
      );
    }
  }

  return (
    <div
      className={
        isDarkMode ? 'dark min-h-dvh bg-slate-950' : 'min-h-dvh bg-cloud-dancer'
      }
    >
      <PwaRegistration />

      <header className="h-20 border-stone-300/70 border-b bg-cloud-dancer/90 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-950 dark:shadow-none motion-reduce:transition-none">
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
              onPress={() => setIsDarkMode((currentMode) => !currentMode)}
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

      <main className="mx-auto max-w-6xl px-3 pt-12 pb-8 sm:px-8 sm:pt-16">
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
          <ul
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
          </ul>
        </section>

        <Card
          className="relative overflow-visible rounded-3xl border border-stone-300 border-t-2 border-t-primary bg-white/80 p-5 shadow-xl shadow-stone-900/5 transition-colors dark:border-primary-dark/40 dark:border-t-primary-dark dark:bg-slate-900 dark:shadow-black/20 motion-reduce:transition-none sm:p-8"
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
                    className="relative flex h-16 min-w-0 flex-1 items-center rounded-2xl border border-slate-300 bg-white transition-shadow duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-primary-dark dark:focus-within:ring-primary-dark/30 motion-reduce:transition-none"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Prefix className="h-full p-0">
                      <LinkIcon className="ml-4 size-6 shrink-0 text-slate-400 dark:text-slate-500 sm:ml-5" />
                    </InputGroup.Prefix>
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
                    className="flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-0 bg-primary px-8 text-lg text-cloud-dancer shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-wait disabled:opacity-75 aria-disabled:cursor-wait aria-disabled:opacity-75 dark:bg-primary-dark dark:shadow-primary-dark/20 dark:focus-visible:ring-primary-dark/40 motion-reduce:transition-none lg:w-auto"
                    type="submit"
                    size="lg"
                    variant="primary"
                    isDisabled={isLoading}
                    isPending={isLoading}
                  >
                    <span>
                      {isLoading ? 'Đang tạo link...' : 'Tạo link hoa hồng'}
                    </span>
                    {isLoading ? (
                      <Spinner className="size-5 text-white" size="sm" />
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
              <div id="form-error" className="min-h-8">
                {error ? (
                  <Alert
                    className="mt-3 flex min-h-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                    status="danger"
                    role="alert"
                    aria-live="assertive"
                  >
                    <Alert.Indicator className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">
                      <ErrorIcon className="size-5" />
                    </Alert.Indicator>
                    <Alert.Content className="min-w-0 flex-1">
                      <Alert.Description className="font-semibold text-sm leading-relaxed">
                        {error}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}
              </div>
            </Form>
          </Card.Content>
        </Card>

        {result ? (
          <Alert
            className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-5 dark:border-primary-dark/40 dark:bg-primary-dark/20 sm:px-8"
            status="success"
            role="status"
            aria-live="polite"
          >
            <Alert.Indicator className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-cloud-dancer dark:bg-primary-dark">
              <CheckIcon className="size-5" />
            </Alert.Indicator>
            <Alert.Content className="min-w-0 flex-1">
              <div className="flex items-center text-primary dark:text-primary-dark">
                <div className="flex flex-col gap-0.5">
                  <strong className="text-base sm:text-lg">
                    Link hoa hồng của bạn
                  </strong>
                  <small className="text-slate-500 dark:text-slate-400">
                    {result.provider === 'shopee' ? 'Shopee' : 'TikTok Shop'}
                  </small>
                </div>
              </div>
              <InputGroup
                className="mt-4 flex h-auto flex-col overflow-hidden rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-950 sm:h-15 sm:flex-row sm:p-0"
                fullWidth
                variant="secondary"
              >
                <InputGroup.Input
                  className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-slate-700 text-sm outline-0 dark:text-slate-200 sm:h-full sm:px-5 sm:text-base"
                  readOnly
                  value={result.affiliateUrl}
                  aria-label="Link hoa hồng đã tạo"
                />
                <InputGroup.Suffix className="h-full w-full p-0 sm:w-auto">
                  <Button
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-primary px-5 font-bold text-cloud-dancer transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-primary/20 dark:bg-primary-dark dark:focus-visible:ring-primary-dark/40 sm:m-1.5 sm:w-auto"
                    type="button"
                    variant="primary"
                    onPress={copyResult}
                  >
                    {isCopied ? (
                      <CheckIcon className="size-5" />
                    ) : (
                      <CopyIcon className="size-5" />
                    )}
                    <span>{isCopied ? 'Đã chép' : 'Sao chép'}</span>
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
            </Alert.Content>
          </Alert>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
          <Separator className="h-px w-12 bg-slate-200 dark:bg-slate-800 sm:w-32" />
          <WifiIcon className="size-5" />
          <p className="m-0 text-sm">Dùng được khi mất mạng</p>
          <Separator className="h-px w-12 bg-slate-200 dark:bg-slate-800 sm:w-32" />
        </div>
      </main>
    </div>
  );
}
