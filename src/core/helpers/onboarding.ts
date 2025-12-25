/**
 * Determines the appropriate onboarding redirect path for a user.
 * 
 * @param {Object} currentUser - The user object from the store
 * @param {boolean} ignoreSkip - Whether to ignore the 'isSkippedOnboarding' flag (force check)
 * @returns {string|null} - The path to redirect to, or null if no redirect is needed
 */
export const getOnboardingRedirect = (currentUser: any, ignoreSkip: boolean = false): string | null => {
  if (!currentUser || !currentUser.id) return null;
  
  const isSkipped = currentUser.isSkippedOnboarding;
  
  // If we respect the skip flag (ignoreSkip=false) and the user has skipped, 
  // they are free to roam (return null).
  if (!ignoreSkip && isSkipped) {
    return null;
  }

  // Stage 1 Check
  if (!currentUser.finishedOnboardingStage1) {
    return '/onboarding/stage1';
  }
  
  // Stage 2 Check
  if (!currentUser.onboardingComplete) {
    return '/onboarding/stage2';
  }
  
  return null;
};

