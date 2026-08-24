# Rich-content security policy

All Admin-authored HTML for Catalog Product descriptions, articles, and education lessons uses `sanitizeRichContent` from `src/lib/rich-content.ts`.

The policy is applied twice:

- at API write boundaries, so new and edited records are stored in sanitized form;
- immediately before public HTML rendering, so legacy records remain safe until rewritten.

Supported authoring markup is deliberately text-oriented: paragraphs, line breaks, emphasis, headings (`h2`–`h4`), block quotes, lists, links, and code blocks. Links may use only `http`, `https`, `mailto`, or `tel`; links opened in a new tab receive `noopener noreferrer`.

Scripts, event handlers, styles, images, iframes, objects, media, protocol-relative URLs, `data:` URLs, and other active or embedded content are removed. Education video URLs are separate from rich HTML and accept only local uploaded MP4/MOV files or canonical HTTPS YouTube/Vimeo URLs.

Public third-party images bypass Next.js server optimization and fail once in the browser to a dimension-preserving fallback. The domain-bound E-Namad seal follows the same rule through its dedicated footer fallback.
