/**
 * Utility to safely access environment variables in both client (Vite) and server (Node.js) environments.
 */
export const getEnv = (key: string): string | undefined => {
  // Check if we're in a Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  
  // Check if we're in a Node environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  return undefined;
};
