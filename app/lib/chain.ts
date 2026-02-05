type SuiMoveField = string | number | boolean | null | undefined | Record<string, any>;

const decodeStringField = (value: SuiMoveField): string => {
  if (typeof value === "string") {
    return value;
  }
  if (!value || typeof value !== "object") {
    return "";
  }
  const bytes = (value as any).fields?.bytes ?? (value as any).bytes;
  if (!bytes) {
    return "";
  }
  if (Array.isArray(bytes)) {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  }
  if (typeof bytes === "string") {
    if (bytes.startsWith("0x")) {
      const hex = bytes.slice(2);
      const pairs = hex.match(/.{1,2}/g) ?? [];
      const arr = pairs.map((b) => parseInt(b, 16));
      return new TextDecoder().decode(Uint8Array.from(arr));
    }
    try {
      const arr = Uint8Array.from(Buffer.from(bytes, "base64"));
      return new TextDecoder().decode(arr);
    } catch {
      return bytes;
    }
  }
  return "";
};

const toNumber = (value: SuiMoveField): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
};

const normalizeId = (value: SuiMoveField): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return (value as any).id;
  }
  return "";
};

const normalizeVector = (value: SuiMoveField): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeId(item)).filter(Boolean);
  }
  if (value && typeof value === "object" && "fields" in value) {
    const inner = (value as any).fields?.contents ?? (value as any).fields?.vec;
    if (Array.isArray(inner)) {
      return inner.map((item: any) => normalizeId(item)).filter(Boolean);
    }
  }
  return [];
};

export const parseContentObject = (object: any) => {
  const fields = object?.content?.fields ?? object?.fields ?? {};
  return {
    objectId: object?.objectId ?? object?.id,
    title: decodeStringField(fields.title),
    description: decodeStringField(fields.description),
    pdfUri: decodeStringField(fields.pdf_uri),
    ratePer10s: toNumber(fields.rate_per_10s),
    creator: fields.creator ?? "",
    vaultId: normalizeId(fields.vault_id),
    createdAtMs: toNumber(fields.created_at_ms),
    tags: [],
  };
};

export const parsePlatformContentIds = (object: any) => {
  const fields = object?.content?.fields ?? object?.fields ?? {};
  return normalizeVector(fields.contents);
};
