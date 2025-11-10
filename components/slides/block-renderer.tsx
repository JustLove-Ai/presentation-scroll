"use client";

interface BlockRendererProps {
  block: any;
  theme?: any;
}

export function BlockRenderer({ block, theme }: BlockRendererProps) {
  const { type, content, style } = block;

  const defaultStyle = {
    ...style,
  };

  // Render based on block type
  switch (type) {
    case "heading":
      const level = content.level || 1;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          className={`font-bold ${
            level === 1
              ? "text-5xl"
              : level === 2
              ? "text-4xl"
              : level === 3
              ? "text-3xl"
              : "text-2xl"
          }`}
          style={defaultStyle}
        >
          {content.text}
        </HeadingTag>
      );

    case "text":
      return (
        <p className="text-xl leading-relaxed" style={defaultStyle}>
          {content.text}
        </p>
      );

    case "bullet-list":
      return (
        <ul className="list-disc list-inside space-y-3 text-xl" style={defaultStyle}>
          {content.items?.map((item: string, index: number) => (
            <li key={index} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );

    case "numbered-list":
      return (
        <ol className="list-decimal list-inside space-y-3 text-xl" style={defaultStyle}>
          {content.items?.map((item: string, index: number) => (
            <li key={index} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      );

    case "quote":
      return (
        <blockquote
          className="border-l-4 border-primary pl-6 italic text-2xl"
          style={defaultStyle}
        >
          {content.text}
        </blockquote>
      );

    case "code":
      return (
        <pre
          className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono"
          style={defaultStyle}
        >
          <code>{content.text}</code>
        </pre>
      );

    case "image":
      const isFullBleed = defaultStyle?.position === "absolute";
      return (
        <div className={isFullBleed ? "" : "flex justify-center"} style={defaultStyle}>
          <img
            src={content.url}
            alt={content.alt || ""}
            className={isFullBleed ? "w-full h-full object-cover" : "max-w-full max-h-96 rounded-lg shadow-lg object-contain"}
            style={isFullBleed ? { position: "absolute", inset: 0 } : {}}
          />
        </div>
      );

    default:
      return (
        <div className="text-muted-foreground" style={defaultStyle}>
          {content.text || "Unsupported block type"}
        </div>
      );
  }
}
