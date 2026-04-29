export function paddedId(id: number): string {
  return `#${id.toString().padStart(4, "0")}`;
}

export function dexHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`;
}

export function dexWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`;
}
