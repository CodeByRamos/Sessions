export const limits = {
  sessionTitle: 60,
  shortDescription: 280,
  longText: 2000,
  competitionName: 80,
  beachName: 60,
  url: 500,
  avatarBytes: 3 * 1024 * 1024,
};

export function trimLimit(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function isValidUrl(value: string, optional = false) {
  if (!value && optional) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isFutureDateTime(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > Date.now();
}

export function isPastOrToday(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const tomorrow = new Date();
  tomorrow.setHours(23, 59, 59, 999);
  return Number.isFinite(date.getTime()) && date.getTime() <= tomorrow.getTime();
}

export function isImageDataUrl(value: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value);
}

export function dataUrlByteSize(value: string) {
  const base64 = value.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}
