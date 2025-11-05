const ASH_BACKEND_URL = process.env.NEXT_PUBLIC_ASH_BACKEND_URL || "http://localhost:4000";

export const auth = {
  /**
   * Get Google OAuth login URL with redirect_uri
   * @param redirectUri - Optional custom redirect URI. Defaults to current origin + /api/auth/callback
   */
  getGoogleLoginUrl(redirectUri?: string): string {
    const baseUrl = `${ASH_BACKEND_URL}/auth/user/google`;
    const callbackUri = redirectUri || `${window.location.origin}/api/auth/callback`;
    return `${baseUrl}?redirect_uri=${encodeURIComponent(callbackUri)}`;
  },

  /**
   * Sign out user by calling API endpoint
   */
  async signOut(): Promise<void> {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  },
};
