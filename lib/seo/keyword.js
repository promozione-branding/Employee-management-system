// lib/seo/keyword.js

// Trim and collapse repeated whitespace, keeping the original casing.
export const normalizeKeywordText = (value = "") =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

// Comparison key: same keyword typed with different case/spacing is a duplicate.
export const keywordKey = (value) => normalizeKeywordText(value).toLowerCase();

// Return the existing keyword (string or { keyword }) that matches, else null.
export const findDuplicateKeyword = (keywords = [], keyword) => {
  const key = keywordKey(keyword);
  if (!key) return null;

  return (
    keywords.find(
      (item) =>
        keywordKey(typeof item === "string" ? item : item?.keyword) === key,
    ) || null
  );
};
