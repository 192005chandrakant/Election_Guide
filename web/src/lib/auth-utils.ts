import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  Auth,
  UserCredential,
  AuthError 
} from "firebase/auth";

/**
 * Enhanced Google Sign-In handler that automatically falls back to redirect
 * if popup is blocked or unavailable
 */
export async function signInWithGoogle(auth: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  
  // Set proper scopes
  provider.addScope("profile");
  provider.addScope("email");
  
  // Set custom parameters for better UX
  provider.setCustomParameters({
    prompt: "select_account",
  });
  
  try {
    // Try popup first (preferred method for better UX)
    // Note: COOP warnings about window.closed are expected and safe for popup auth
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    const authError = error as AuthError;
    
    // Check if popup was blocked or COOP is causing issues
    if (authError.code === "auth/popup-blocked" || 
        authError.code === "auth/operation-not-allowed" ||
        authError.code === "auth/popup-closed-by-user" ||
        isPopupBlockedError(authError)) {
      
      console.warn("Popup blocked or unavailable, falling back to redirect...", authError.code);
      
      // Fall back to redirect method
      try {
        await signInWithRedirect(auth, provider);
        // Note: The actual sign-in result needs to be checked on page load
        // Use getRedirectResult() after auth is initialized
        throw new Error("Redirect in progress. Please wait...");
      } catch (redirectError) {
        const redirectAuthError = redirectError as AuthError;
        if (redirectAuthError.code === "auth/popup-blocked") {
          throw new Error(
            "Both popup and redirect methods are blocked. Please check your browser settings and allow popups for this site."
          );
        }
        throw redirectError;
      }
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Check redirect result after page load
 * This should be called during auth initialization
 */
export async function checkRedirectResult(auth: Auth): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    const authError = error as AuthError;
    console.error("Redirect result error:", authError);
    
    // Some errors can be safely ignored as they're part of normal flow
    if (authError.code === "auth/no-auth-event") {
      return null; // No ongoing redirect
    }
    
    throw error;
  }
}

/**
 * Detect if the error is likely due to popup being blocked
 */
function isPopupBlockedError(error: AuthError): boolean {
  const message = error.message?.toLowerCase() || "";
  const code = error.code?.toLowerCase() || "";
  
  return (
    message.includes("popup") && 
    message.includes("blocked") ||
    code.includes("popup")
  );
}

/**
 * Format Firebase auth error messages for user display
 */
export function formatAuthError(error: unknown): string {
  if (error instanceof Error) {
    const authError = error as AuthError;
    
    // Handle specific Firebase auth errors
    switch (authError.code) {
      case "auth/popup-blocked":
        return "Popup was blocked. Please allow popups for this site and try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled. Please contact support.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/invalid-email":
        return "Invalid email address. Please check and try again.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/email-already-in-use":
        return "Email already in use. Please sign in or use a different email.";
      case "auth/user-not-found":
        return "User not found. Please create an account first.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed sign-in attempts. Please try again later.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/requires-recent-login":
        return "Please sign in again to complete this action.";
      case "auth/no-auth-event":
        return "Sign-in cancelled. Please try again.";
      default:
        // Return custom message if available, otherwise generic message
        if (authError.message) {
          return authError.message;
        }
        return "Authentication failed. Please try again.";
    }
  }
  return "Authentication failed. Please try again.";
}

/**
 * Enhance Firebase error with better logging
 */
export function logAuthError(error: unknown, context: string): void {
  if (error instanceof Error) {
    const authError = error as AuthError;
    console.error(`[${context}] Firebase Auth Error:`, {
      code: authError.code,
      message: authError.message,
      error: authError,
    });
  } else {
    console.error(`[${context}] Unknown error:`, error);
  }
}
