import { CountMethod } from "../features/counting";

export const countMethodHint: Record<
  CountMethod,
  { title: string; desc: string; imgSrc: string; label: string }
> = {
  [CountMethod.NONE]: {
    title: "None",
    label: "",
    desc: "",
    imgSrc: "",
  },
  [CountMethod.ALL]: {
    title: "Count all",
    label: "count",
    desc: "Counts the total number of pages, including blank pages.",
    imgSrc: "https://www.notion.so/images/aggregations/count.0229e394.png",
  },
  [CountMethod.VALUES]: {
    title: "Count values",
    label: "values",
    desc: "Counts the number of non-empty values for this property. For a type that can contain multiple values like multi-select or person, this will count the number of selected values for each page.",
    imgSrc:
      "https://www.notion.so/images/aggregations/countValues.81e24549.png",
  },
  [CountMethod.UNIQUE]: {
    title: "Count unique values",
    label: "unique",
    desc: "Counts the number of unique values for this property. For a type that can contain multiple values like multi-select or person, this will count the unique values across all pages.",
    imgSrc: "https://www.notion.so/images/aggregations/unique.05e3efe4.png",
  },
  [CountMethod.EMPTY]: {
    title: "Count empty",
    label: "empty",
    desc: "Counts the number of pages with an empty value for this property.",
    imgSrc: "https://www.notion.so/images/aggregations/empty.5a8e8976.png",
  },
  [CountMethod.NONEMPTY]: {
    title: "Count not empty",
    label: "not empty",
    desc: "Counts the number of pages with a non-empty value for this property.",
    imgSrc: "https://www.notion.so/images/aggregations/notEmpty.f8f86445.png",
  },
  [CountMethod.CHECKED]: {
    title: "Checked",
    label: "checked",
    desc: "Counts the number of pages with a checked checkbox for this property.",
    imgSrc: "https://www.notion.so/images/aggregations/checked.559fd230.png",
  },
  [CountMethod.UNCHECKED]: {
    title: "Unchecked",
    label: "unchecked",
    desc: "Counts the number of pages with an unchecked checkbox for this property.",
    imgSrc: "https://www.notion.so/images/aggregations/unchecked.e4120d79.png",
  },
  [CountMethod.PERCENTAGE_CHECKED]: {
    title: "Percent checked",
    label: "checked",
    desc: "https://www.notion.so/images/aggregations/percentChecked.4bc2f766.png",
    imgSrc:
      "Displays the percentage of pages that have a checked checkbox for this property.",
  },
  [CountMethod.PERCENTAGE_UNCHECKED]: {
    title: "Percent unchecked",
    label: "unchecked",
    desc: "Displays the percentage of pages that have an unchecked checkbox for this property.",
    imgSrc:
      "https://www.notion.so/images/aggregations/percentUnchecked.1df5ea48.png",
  },
  [CountMethod.PERCENTAGE_EMPTY]: {
    title: "Percent empty",
    label: "empty",
    desc: "Displays the percentage of pages that have an empty value for this property.",
    imgSrc:
      "https://www.notion.so/images/aggregations/percentEmpty.8e070da8.png",
  },
  [CountMethod.PERCENTAGE_NONEMPTY]: {
    title: "Percent not empty",
    label: "not empty",
    desc: "Displays the percentage of pages that have a non-empty value for this property.",
    imgSrc:
      "https://www.notion.so/images/aggregations/percentNotEmpty.c3ac1c83.png",
  },
};
