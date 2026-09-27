"use client";

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
import styles from "./commission-link-builder.module.css";

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
    <div className={styles.shell}>
      <PwaRegistration />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a
            className={styles.brand}
            href="/"
            aria-label="Lấy Link - Trang chủ"
          >
            <span className={styles.brandMark}>
              <LinkIcon />
            </span>
            <span>
              <strong>Lấy Link</strong>
              <small>Shopee &amp; TikTok Affiliate</small>
            </span>
          </a>
          <nav className={styles.platforms} aria-label="Nền tảng được hỗ trợ">
            <span className={`${styles.platform} ${styles.shopee}`}>
              <b>S</b> Shopee
            </span>
            <span className={`${styles.platform} ${styles.tiktok}`}>
              <b>♪</b> TikTok Shop
            </span>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="page-title">
          <h1 id="page-title">Tạo link hoa hồng</h1>
          <p>
            Dán link sản phẩm Shopee hoặc TikTok Shop. Chúng tôi sẽ tạo link
            affiliate sẵn sàng để bạn chia sẻ.
          </p>
          <ul className={styles.benefits} aria-label="Lợi ích">
            {benefits.map(({ label, Icon }) => (
              <li className={styles.benefit} key={label}>
                <Icon />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <form className={styles.form} onSubmit={submit} noValidate>
          <label htmlFor="product-url">Dán link sản phẩm</label>
          <div className={styles.inputRow}>
            <LinkIcon className={styles.inputIcon} />
            <input
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
            <button
              className={styles.pasteButton}
              type="button"
              onClick={pasteFromClipboard}
            >
              <ClipboardIcon />
              <span>Dán</span>
            </button>
          </div>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={isLoading}
          >
            <span>{isLoading ? "Đang tạo link..." : "Tạo link hoa hồng"}</span>
            {isLoading ? <span className={styles.spinner} /> : <ArrowIcon />}
          </button>
          <p id="form-note" className={styles.formNote}>
            Hỗ trợ liên kết sản phẩm từ Shopee và TikTok Shop
          </p>
          <p id="form-error" className={styles.formError} role="alert">
            {error}
          </p>
        </form>

        {result ? (
          <section className={styles.result} aria-live="polite">
            <div className={styles.resultTitle}>
              <span className={styles.checkBadge}>
                <CheckIcon />
              </span>
              <div>
                <strong>Link hoa hồng của bạn</strong>
                <small>
                  {result.provider === "shopee" ? "Shopee" : "TikTok Shop"}
                </small>
              </div>
            </div>
            <div className={styles.resultRow}>
              <input
                readOnly
                value={result.affiliateUrl}
                aria-label="Link hoa hồng đã tạo"
              />
              <button type="button" onClick={copyResult}>
                {isCopied ? <CheckIcon /> : <CopyIcon />}
                <span>{isCopied ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>
          </section>
        ) : null}

        <div className={styles.offlineNote}>
          <span />
          <WifiIcon />
          <p>Dùng được khi mất mạng</p>
          <span />
        </div>
      </main>
    </div>
  );
}
