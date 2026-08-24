import sanitizeHtml from "sanitize-html";

/**
 * The single policy for HTML authored in the Admin and rendered publicly.
 *
 * Rich content is text-oriented: formatting, lists, headings, code, quotes,
 * and safe links are supported. Active content, media, styles, and embeds are
 * deliberately excluded so stored markup cannot execute or load third-party
 * resources inside a Catalog Product, article, or education lesson.
 */
export function sanitizeRichContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "a",
      "code",
      "pre",
    ],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => {
        const { target, ...safeAttributes } = attributes;

        return {
          tagName: "a",
          attribs: {
            ...safeAttributes,
            ...(target === "_blank" ? { target } : {}),
            rel: "noopener noreferrer",
          },
        };
      },
    },
  });
}

export function sanitizeOptionalRichContent(
  html: string | null | undefined,
): string | null | undefined {
  return typeof html === "string" ? sanitizeRichContent(html) : html;
}

type CatalogProductDescriptions = {
  description?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
};

export function sanitizeCatalogProductDescriptions(
  descriptions: CatalogProductDescriptions,
): CatalogProductDescriptions {
  return {
    description: sanitizeOptionalRichContent(descriptions.description),
    descriptionEn: sanitizeOptionalRichContent(descriptions.descriptionEn),
    descriptionAr: sanitizeOptionalRichContent(descriptions.descriptionAr),
  };
}
