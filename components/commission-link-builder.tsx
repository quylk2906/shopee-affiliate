"use client";

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
} from "@heroui/react";
import { type FormEvent, useState } from "react";
import {
  ArrowIcon,
  BoltIcon,
  CheckIcon,
  ClipboardIcon,
  CopyIcon,
  GiftIcon,
  LinkIcon,
  ShieldIcon,
  WifiIcon,
} from "@/components/icons";
import { PwaRegistration } from "@/components/pwa-registration";

type GeneratedLink = { affiliateUrl: string; provider: "shopee" | "tiktok" };

const benefits = [
  { label: "Hoa hồng minh bạch", Icon: ShieldIcon },
  { label: "Không cần cài app", Icon: BoltIcon },
  { label: "Miễn phí 100%", Icon: GiftIcon },
];

function isSupportedUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      host === "shopee.vn" ||
      host.endsWith(".shopee.vn") ||
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com")
    );
  } catch {
    return false;
  }
}

export function CommissionLinkBuilder() {
  const [productUrl, setProductUrl] = useState("");
  const [result, setResult] = useState<GeneratedLink | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  async function pasteFromClipboard() {
    setError("");
    try {
      setProductUrl((await navigator.clipboard.readText()).trim());
    } catch {
      setError(
        "Trình duyệt chưa cho phép đọc bộ nhớ tạm. Hãy dán link thủ công.",
      );
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsCopied(false);
    const normalizedUrl = productUrl.trim();
    if (!isSupportedUrl(normalizedUrl)) {
      setError("Vui lòng nhập link sản phẩm Shopee hoặc TikTok Shop hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/affiliate-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl: normalizedUrl }),
      });
      const data = (await response.json()) as GeneratedLink & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          data.error || "Không thể tạo link lúc này. Vui lòng thử lại.",
        );
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tạo link lúc này. Vui lòng thử lại.",
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
        "Không thể sao chép tự động. Hãy chọn và sao chép link thủ công.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fbfa]">
      <PwaRegistration />
      <header className="h-[86px] border-[#eef2f0] border-b bg-white shadow-[0_3px_16px_rgba(16,24,40,0.04)] max-[720px]:h-[76px]">
        <div className="mx-auto flex h-full w-[min(1312px,calc(100%-64px))] items-center justify-between max-[720px]:w-[calc(100%-32px)]">
          <HeroLink
            className="flex items-center gap-[13px] text-[#0b7a5a] no-underline max-[720px]:gap-[9px]"
            href="/"
            aria-label="Lấy Link - Trang chủ"
          >
            <span className="grid size-[42px] place-items-center max-[720px]:size-[34px]">
              <LinkIcon className="size-[42px] stroke-[2.4] max-[720px]:size-[34px]" />
            </span>
            <span className="flex flex-col leading-[1.12]">
              <strong className="text-[27px] tracking-[-0.7px] max-[720px]:text-[21px]">
                Lấy Link
              </strong>
              <small className="mt-1 text-[#475467] text-sm font-medium tracking-[0.01em] max-[720px]:text-[11px] max-[390px]:hidden">
                Shopee &amp; TikTok Affiliate
              </small>
            </span>
          </HeroLink>
          <nav className="flex gap-3" aria-label="Nền tảng được hỗ trợ">
            <Chip
              className="inline-flex h-12 items-center gap-2.5 whitespace-nowrap rounded-[11px] border-[1.5px] border-[#f2765e] bg-white px-[18px] font-bold text-[#ed4d2d] text-base max-[720px]:h-[38px] max-[720px]:gap-0 max-[720px]:px-[11px] max-[720px]:text-[0px]"
              size="lg"
              variant="secondary"
            >
              <b className="grid size-[25px] place-items-center rounded-md bg-[#ed4d2d] text-[15px] text-white max-[720px]:size-[22px] max-[720px]:text-[13px]">
                S
              </b>{" "}
              Shopee
            </Chip>
            <Chip
              className="inline-flex h-12 items-center gap-2.5 whitespace-nowrap rounded-[11px] border-[1.5px] border-[#303030] bg-white px-[18px] font-bold text-[#101010] text-base max-[720px]:h-[38px] max-[720px]:gap-0 max-[720px]:px-[11px] max-[720px]:text-[0px]"
              size="lg"
              variant="secondary"
            >
              <b className="grid size-[25px] place-items-center rounded-md bg-[#111] text-[15px] text-white [text-shadow:-1px_-1px_#25f4ee,1px_1px_#fe2c55] max-[720px]:size-[22px] max-[720px]:text-[13px]">
                ♪
              </b>{" "}
              TikTok Shop
            </Chip>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-[min(980px,calc(100%-40px))] py-[68px] pb-[38px] max-[720px]:w-[min(100%-28px,560px)] max-[720px]:pt-12">
        <section className="text-center" aria-labelledby="page-title">
          <h1
            id="page-title"
            className="m-0 font-[760] text-[clamp(42px,5vw,64px)] text-[#080d19] leading-[1.05] tracking-[-0.055em] max-[720px]:text-[39px]"
          >
            Tạo link hoa hồng
          </h1>
          <p className="mx-auto mt-[18px] max-w-[740px] text-[#475467] text-[21px] leading-normal max-[720px]:mt-[15px] max-[720px]:text-[17px] max-[720px]:leading-[1.55]">
            Dán link sản phẩm Shopee hoặc TikTok Shop. Chúng tôi sẽ tạo link
            affiliate sẵn sàng để bạn chia sẻ.
          </p>
          <ul
            className="mx-auto mt-[29px] mb-[42px] flex list-none justify-center gap-[70px] p-0 max-[720px]:mx-0 max-[720px]:mt-[26px] max-[720px]:mb-8 max-[720px]:justify-between max-[720px]:gap-0"
            aria-label="Lợi ích"
          >
            {benefits.map(({ label, Icon }) => (
              <li
                className="flex items-center gap-3 whitespace-nowrap font-[560] text-[#101828] text-[17px] max-[720px]:flex-col max-[720px]:gap-[7px] max-[720px]:whitespace-normal max-[720px]:text-center max-[720px]:text-xs max-[390px]:max-w-[94px]"
                key={label}
              >
                <Icon className="size-[34px] stroke-[1.9] text-[#0b7a5a] max-[720px]:size-[29px]" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <Card
          className="rounded-[20px] border border-[#dfe5e3] bg-white px-[37px] pt-[35px] pb-[26px] shadow-[0_16px_40px_rgba(16,24,40,0.06)] max-[720px]:rounded-[17px] max-[720px]:px-[18px] max-[720px]:pt-6 max-[720px]:pb-[18px]"
          variant="default"
        >
          <Card.Content className="block p-0">
            <Form
              className="block"
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
                <Label className="mb-3.5 block font-bold text-[17px]">
                  Dán link sản phẩm
                </Label>
                <InputGroup
                  className="relative flex h-[66px] items-center rounded-xl border-[1.5px] border-[#cbd3dd] bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-[#0b7a5a] focus-within:shadow-[0_0_0_4px_rgba(11,122,90,0.12)] motion-reduce:transition-none max-[720px]:h-[60px]"
                  fullWidth
                  variant="secondary"
                >
                  <InputGroup.Prefix className="h-full p-0">
                    <LinkIcon className="ml-5 size-6 shrink-0 text-[#7b8799] max-[720px]:ml-3.5" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-[#263143] text-lg outline-0 placeholder:text-[#98a2b3] placeholder:opacity-100 max-[720px]:px-[9px] max-[720px]:text-[15px]"
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
                  />
                  <InputGroup.Suffix className="h-full p-0">
                    <Button
                      className="mr-1.5 flex h-[52px] cursor-pointer items-center gap-[9px] rounded-[10px] border border-[#c4eadb] bg-[#eaf8f3] px-5 font-bold text-[#0b7a5a] transition-[background,transform] duration-200 hover:bg-[#dff4ec] focus-visible:outline-3 focus-visible:outline-[#0b7a5a]/28 focus-visible:outline-offset-3 active:translate-y-px motion-reduce:transition-none max-[720px]:h-12 max-[720px]:w-12 max-[720px]:justify-center max-[720px]:px-0"
                      type="button"
                      variant="secondary"
                      size="lg"
                      onPress={pasteFromClipboard}
                    >
                      <ClipboardIcon className="size-[21px]" />
                      <span className="max-[720px]:hidden">Dán</span>
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
              <Button
                className="mt-4 flex h-[66px] w-full cursor-pointer items-center justify-center gap-3.5 rounded-[11px] border-0 bg-[#0b7a5a] text-[19px] text-white shadow-[0_7px_18px_rgba(11,122,90,0.17)] transition-[background,transform,box-shadow] duration-200 focus-visible:outline-3 focus-visible:outline-[#0b7a5a]/28 focus-visible:outline-offset-3 [&:not(:disabled):not([aria-disabled=true]):hover]:-translate-y-px [&:not(:disabled):not([aria-disabled=true]):hover]:bg-[#086246] [&:not(:disabled):not([aria-disabled=true]):hover]:shadow-[0_10px_22px_rgba(11,122,90,0.22)] disabled:cursor-wait disabled:opacity-[0.78] aria-disabled:cursor-wait aria-disabled:opacity-[0.78] motion-reduce:transition-none max-[720px]:h-[58px] max-[720px]:text-[17px]"
                type="submit"
                fullWidth
                size="lg"
                variant="primary"
                isDisabled={isLoading}
                isPending={isLoading}
              >
                <span>
                  {isLoading ? "Đang tạo link..." : "Tạo link hoa hồng"}
                </span>
                {isLoading ? (
                  <Spinner className="size-5 text-white" size="sm" />
                ) : (
                  <ArrowIcon className="size-6" />
                )}
              </Button>
              <p
                id="form-note"
                className="mt-5 mb-0 text-center text-[#667085] text-sm max-[720px]:leading-[1.4]"
              >
                Hỗ trợ liên kết sản phẩm từ Shopee và TikTok Shop
              </p>
              <div id="form-error" className="min-h-[34px]">
                {error ? (
                  <Alert
                    className="mt-2 min-h-0 rounded-[10px] px-3 py-2 font-[560] text-sm"
                    status="danger"
                  >
                    <Alert.Content>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}
              </div>
            </Form>
          </Card.Content>
        </Card>

        {result ? (
          <Alert
            className="mt-[22px] flex items-start gap-[13px] rounded-[18px] border border-[#b9e6d5] bg-[#f0fbf7] px-8 py-[25px] max-[720px]:px-[18px] max-[720px]:py-5"
            status="success"
            role="status"
            aria-live="polite"
          >
            <Alert.Indicator className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0b7a5a] text-white">
              <CheckIcon className="size-5" />
            </Alert.Indicator>
            <Alert.Content className="min-w-0 flex-1">
              <div className="flex items-center text-[#0b7a5a]">
                <div className="flex flex-col gap-0.5">
                  <strong className="text-[17px]">Link hoa hồng của bạn</strong>
                  <small className="text-[#667085]">
                    {result.provider === "shopee" ? "Shopee" : "TikTok Shop"}
                  </small>
                </div>
              </div>
              <InputGroup
                className="mt-3.5 flex h-[60px] overflow-hidden rounded-[11px] border border-[#cbd3dd] bg-white max-[720px]:h-auto max-[720px]:flex-col max-[720px]:p-2"
                fullWidth
                variant="secondary"
              >
                <InputGroup.Input
                  className="min-w-0 flex-1 border-0 bg-transparent px-5 text-[#344054] text-[17px] outline-0 max-[720px]:h-12 max-[720px]:px-2.5 max-[720px]:text-sm"
                  readOnly
                  value={result.affiliateUrl}
                  aria-label="Link hoa hồng đã tạo"
                />
                <InputGroup.Suffix className="h-full p-0 max-[720px]:w-full">
                  <Button
                    className="m-1.5 flex cursor-pointer items-center gap-[9px] rounded-lg border-0 bg-[#0b7a5a] px-5 font-bold text-white focus-visible:outline-3 focus-visible:outline-[#0b7a5a]/28 focus-visible:outline-offset-3 max-[720px]:m-0 max-[720px]:h-[46px] max-[720px]:w-full max-[720px]:justify-center"
                    type="button"
                    variant="primary"
                    onPress={copyResult}
                  >
                    {isCopied ? (
                      <CheckIcon className="size-5" />
                    ) : (
                      <CopyIcon className="size-5" />
                    )}
                    <span>{isCopied ? "Đã chép" : "Sao chép"}</span>
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
            </Alert.Content>
          </Alert>
        ) : null}

        <div className="mt-[33px] flex items-center justify-center gap-3.5 text-[#8893a3]">
          <Separator className="h-px w-[130px] bg-[#d9dfdf] max-[720px]:w-11" />
          <WifiIcon className="size-[22px]" />
          <p className="m-0 text-sm">Dùng được khi mất mạng</p>
          <Separator className="h-px w-[130px] bg-[#d9dfdf] max-[720px]:w-11" />
        </div>
      </main>
    </div>
  );
}
