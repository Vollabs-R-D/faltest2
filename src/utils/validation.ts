export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidZipUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return url.toLowerCase().endsWith('.zip');
  } catch {
    return false;
  }
}