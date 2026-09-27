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
          <HeroLink
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
          </HeroLink>
          <nav className={styles.platforms} aria-label="Nền tảng được hỗ trợ">
            <Chip
              className={`${styles.platform} ${styles.shopee}`}
              size="lg"
              variant="secondary"
            >
              <b>S</b> Shopee
            </Chip>
            <Chip
              className={`${styles.platform} ${styles.tiktok}`}
              size="lg"
              variant="secondary"
            >
              <b>♪</b> TikTok Shop
            </Chip>
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

        <Card className={styles.formCard} variant="default">
          <Card.Content className={styles.formBody}>
            <Form
              className={styles.form}
              onSubmit={submit}
              validationBehavior="aria"
              aria-label="Tạo link hoa hồng"
            >
              <TextField
                className={styles.textField}
                fullWidth
                name="productUrl"
                variant="secondary"
              >
                <Label>Dán link sản phẩm</Label>
                <InputGroup
                  className={styles.inputRow}
                  fullWidth
                  variant="secondary"
                >
                  <InputGroup.Prefix className={styles.inputPrefix}>
                    <LinkIcon className={styles.inputIcon} />
                  </InputGroup.Prefix>
                  <InputGroup.Input
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
                  <InputGroup.Suffix className={styles.inputSuffix}>
                    <Button
                      className={styles.pasteButton}
                      type="button"
                      variant="secondary"
                      size="lg"
                      onPress={pasteFromClipboard}
                    >
                      <ClipboardIcon />
                      <span>Dán</span>
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
              <Button
                className={styles.submitButton}
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
                  <Spinner className={styles.loadingSpinner} size="sm" />
                ) : (
                  <ArrowIcon />
                )}
              </Button>
              <p id="form-note" className={styles.formNote}>
                Hỗ trợ liên kết sản phẩm từ Shopee và TikTok Shop
              </p>
              <div id="form-error" className={styles.errorSlot}>
                {error ? (
                  <Alert className={styles.errorAlert} status="danger">
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
            className={styles.result}
            status="success"
            role="status"
            aria-live="polite"
          >
            <Alert.Indicator className={styles.checkBadge}>
              <CheckIcon />
            </Alert.Indicator>
            <Alert.Content className={styles.resultContent}>
              <div className={styles.resultTitle}>
                <div>
                  <strong>Link hoa hồng của bạn</strong>
                  <small>
                    {result.provider === "shopee" ? "Shopee" : "TikTok Shop"}
                  </small>
                </div>
              </div>
              <InputGroup
                className={styles.resultRow}
                fullWidth
                variant="secondary"
              >
                <InputGroup.Input
                  readOnly
                  value={result.affiliateUrl}
                  aria-label="Link hoa hồng đã tạo"
                />
                <InputGroup.Suffix className={styles.resultSuffix}>
                  <Button type="button" variant="primary" onPress={copyResult}>
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    <span>{isCopied ? "Đã chép" : "Sao chép"}</span>
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
            </Alert.Content>
          </Alert>
        ) : null}

        <div className={styles.offlineNote}>
          <Separator className={styles.offlineLine} />
          <WifiIcon />
          <p>Dùng được khi mất mạng</p>
          <Separator className={styles.offlineLine} />
        </div>
      </main>
    </div>
  );
}
