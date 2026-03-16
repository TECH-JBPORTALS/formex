import Format01Page from "./format01-page";
import Format02Page from "./format02-page";
import Format03Page from "./format03-page";
import Format04Page from "./format04-page";
import Format05Page from "./format05-page";

export const templatePages = [
  {
    id: 1,
    name: "INS Format 01",
    slug: "ins-format-01",
    page: Format01Page,
    type: "institution",
  },
  {
    id: 2,
    name: "INS Format 02",
    slug: "ins-format-02",
    page: Format02Page,
    type: "branch",
  },
  {
    id: 3,
    name: "INS Format 03",
    slug: "ins-format-03",
    page: Format03Page,
    type: "institution",
  },
  {
    id: 4,
    name: "INS Format 04",
    slug: "ins-format-04",
    page: Format04Page,
    type: "branch",
  },
  {
    id: 5,
    name: "INS Format 05",
    slug: "ins-format-05",
    page: Format05Page,
    type: "institution",
  },
];

export function getTemplatePagesByType(
  type: "institution" | "branch" | "semester",
) {
  return templatePages.filter((t) => t.type === type);
}

export function getTemplatePage(slug: string) {
  return templatePages.find((t) => t.slug === slug);
}
