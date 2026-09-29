import { Button, Tooltip } from '@heroui/react';
import { useState } from 'react';

type CodeSnippetProps = {
  text: string;
};

export default function CodeSnippet({ text }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-default-100 px-3 py-2">
      <pre className="flex-1 font-mono text-sm">
        <code>
          <span className="text-default-500">$ </span>
          {text}
        </code>
      </pre>

      <Tooltip>
        <Button size="sm" isIconOnly variant="ghost" onPress={copy}>
          {copied ? '✓' : '📋'}
        </Button>

        <Tooltip.Content>{copied ? 'Copied!' : 'Copy'}</Tooltip.Content>
      </Tooltip>
    </div>
  );
}
