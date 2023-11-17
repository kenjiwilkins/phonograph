export const isDev = import.meta.env.MODE === "development";

export function getLocalStorage(key: string): string {
  return localStorage.getItem(key)!;
}

export function setLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

export function getAccessToken(): string {
  return getLocalStorage("accessToken");
}

export function resetAccessToken(): void {
  removeLocalStorage("accessToken");
}
