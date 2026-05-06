export type TransmissionKind = "manual" | "automatic";

export function parseCategoryTokens(categoryText: string): string[] {
  return categoryText
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

export function classifyTransmissionToken(token: string): TransmissionKind | null {
  const t = token.trim().toLowerCase();
  if (!t) return null;

  if (["manual", "mt", "m/t", "stick", "stick shift"].includes(t) || /\bmanual\b/.test(t)) {
    return "manual";
  }

  if (
    ["automatic", "auto", "at", "a/t", "cvt", "dsg", "amt"].includes(t) ||
    /\bautomatic\b/.test(t) ||
    /\bcvt\b/.test(t)
  ) {
    return "automatic";
  }

  return null;
}

export function transmissionFromCategoryTokens(tokens: string[]): TransmissionKind | null {
  for (const token of tokens) {
    const kind = classifyTransmissionToken(token);
    if (kind) return kind;
  }
  return null;
}

export function categoryTokensWithoutTransmission(tokens: string[]): string[] {
  return tokens.filter((token) => !classifyTransmissionToken(token));
}
