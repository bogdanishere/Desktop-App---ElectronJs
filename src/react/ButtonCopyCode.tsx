import React, { useEffect, useState } from "react";

export default function ButtonCopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeoutId = setTimeout(() => setCopied(false), 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return <button onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>;
}
