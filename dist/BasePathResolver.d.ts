/**
 * BasePathResolver - Responsible for determining the application's base path
 *
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * resolving the base path for loading assets (like WASM files) in various deployment scenarios.
 */
export declare class BasePathResolver {
    private static readonly ASSET_PATTERNS;
    private cachedBasePath;
    /**
     * Determine the base path for the application
     * This method implements a fallback hierarchy:
     * 1. Check for <base> tag href attribute
     * 2. Extract from existing script tags
     * 3. Check if running in Vite dev mode (import.meta.env.DEV)
     * 4. Default to '/'
     * The path is normalized to always end with '/'
     */
    getBasePath(): string;
    /**
     * Extract base path from existing script tags
     * This method attempts to infer the base path by looking for script tags with src attributes
     * that might indicate the deployment path. Falls back to empty string if no clear pattern is found.
     */
    private getBasePathFromScripts;
}
