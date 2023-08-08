export function toPositiveNumberOrDefault(value: number, defaultValue: number) {
  const cast = Number(value);
  const clean = Number.isInteger(cast) && cast > 0 ? cast : defaultValue;

  return clean;
}
