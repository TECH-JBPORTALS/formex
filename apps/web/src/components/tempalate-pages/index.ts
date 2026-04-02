/**
 * Registry for template / format pages shown in the sidebar and future routes.
 * `kind` groups templates for `getTemplatePagesByType`.
 */
export type TemplatePageKind = "institution" | "program";

export type TemplatePageEntry = {
  id: number;
  name: string;
  /** Stable slug for URLs when wired to app routes */
  slug: string;
  kind: TemplatePageKind;
};

const TEMPLATE_PAGES: TemplatePageEntry[] = [
  {
    id: 1,
    name: "Format 01 — Cover & profile",
    slug: "format-01",
    kind: "institution",
  },
  {
    id: 2,
    name: "Format 02 — Program vision & PEOs",
    slug: "format-02",
    kind: "program",
  },
  {
    id: 3,
    name: "Format 03 — Academic calendar",
    slug: "format-03",
    kind: "institution",
  },
  {
    id: 4,
    name: "Format 04 — Academic calendar (variant)",
    slug: "format-04",
    kind: "institution",
  },
  {
    id: 5,
    name: "Format 05 — Course LH / DH schedule",
    slug: "format-05",
    kind: "program",
  },
];

export type TemplatePageListItem = Pick<TemplatePageEntry, "id" | "name">;

export function getTemplatePagesByType(
  type: TemplatePageKind,
): TemplatePageListItem[] {
  return TEMPLATE_PAGES.filter((p) => p.kind === type).map(({ id, name }) => ({
    id,
    name,
  }));
}

export function getAllTemplatePages(): readonly TemplatePageEntry[] {
  return TEMPLATE_PAGES;
}

export function getTemplatePageBySlug(
  slug: string,
): TemplatePageEntry | undefined {
  return TEMPLATE_PAGES.find((p) => p.slug === slug);
}
