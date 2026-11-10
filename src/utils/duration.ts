export function durationLabel(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isSafeInteger(minutes) || minutes < 0)
    return "Chưa xác minh";
  const h = Math.floor(minutes / 60),
    m = minutes % 60;
  return h ? h + " giờ" + (m ? " " + m + " phút" : "") : m + " phút";
}
export function sessionMinutes(
  start: string | null | undefined,
  end: string | null | undefined,
): number | null {
  const parse = (v: string | null | undefined) => {
    if (!v || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::00(?:\.0{1,9})?)?$/.test(v))
      return null;
    const [h, m] = v.split(":").map(Number);
    return h * 60 + m;
  };
  const a = parse(start),
    b = parse(end);
  return a === null || b === null || b <= a ? null : b - a;
}
