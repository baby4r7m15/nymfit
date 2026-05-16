import { useUser } from '@/lib/UserContext';

/**
 * Returns an object where each key is a premium feature ID and value is boolean.
 * Also exposes `isPremium` for the overall premium status.
 *
 * Usage:
 *   const { isPremium, hasFeature } = usePremium();
 *   hasFeature('ai_coach')  // true/false
 */
export function usePremium() {
  const { user } = useUser();

  const hasFeature = (featureId) => {
    return true; // TEMP: all features unlocked for everyone
  };

  return {
    isPremium: true, // TEMP: all features unlocked for everyone
    hasFeature,
  };
}