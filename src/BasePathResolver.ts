/**
 * BasePathResolver - Responsible for determining the application's base path
 * 
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * resolving the base path for loading assets (like WASM files) in various deployment scenarios.
 */
export class BasePathResolver {
  // Asset directory patterns used for base path detection
  private static readonly ASSET_PATTERNS = ['/assets/', '/js/', '/dist/'] as const;
  
  private cachedBasePath: string | null = null;

  /**
   * Determine the base path for the application
   * This method implements a fallback hierarchy:
   * 1. Check for <base> tag href attribute
   * 2. Extract from existing script tags
   * 3. Check if running in Vite dev mode (import.meta.env.DEV)
   * 4. Default to '/'
   * The path is normalized to always end with '/'
   */
  getBasePath(): string {
    // Return cached value if available
    if (this.cachedBasePath !== null) {
      return this.cachedBasePath;
    }
    
    // Try <base> tag first
    let basePath = document.querySelector('base')?.getAttribute('href');

    // If we got a value from <base>, normalize absolute URLs to pathname only
    if (basePath) {
      try {
        const url = new URL(basePath, window.location.href);
        basePath = url.pathname;
      } catch {
        // If parsing fails, keep the original value (likely already a relative path)
      }
    }
    
    // Fall back to script tag analysis
    if (!basePath) {
      basePath = this.getBasePathFromScripts();
    }
    
    // Check if running in Vite dev mode (window.location.pathname contains the base)
    if (!basePath && window.location.pathname && window.location.pathname !== '/') {
      // In dev mode, Vite may serve from a base path like /cat-oscilloscope or /cat-oscilloscope/
      // Extract the first path segment robustly (handles /cat-oscilloscope, /cat-oscilloscope/, /cat-oscilloscope/page, etc.)
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter((segment) => segment.length > 0);
      if (segments.length > 0) {
        basePath = `/${segments[0]}/`;
      }
    }
    
    // Default to root
    if (!basePath) {
      basePath = '/';
    }
    
    // Normalize: ensure trailing slash
    if (!basePath.endsWith('/')) {
      basePath += '/';
    }
    
    // Cache the result
    this.cachedBasePath = basePath;
    return basePath;
  }
  
  /**
   * Extract base path from existing script tags
   * This method attempts to infer the base path by looking for script tags with src attributes
   * that might indicate the deployment path. Falls back to empty string if no clear pattern is found.
   */
  private getBasePathFromScripts(): string {
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src) {
        try {
          // Try to parse as URL to handle both absolute and relative paths
          const url = new URL(src, window.location.href);
          const pathname = url.pathname;
          
          // Look for common asset directory patterns
          for (const pattern of BasePathResolver.ASSET_PATTERNS) {
            const index = pathname.indexOf(pattern);
            if (index >= 0) {
              // Extract everything before the asset directory
              // For '/assets/file.js', index=0, return '/' (root directory)
              // For '/cat-oscilloscope/assets/file.js', index=17, return '/cat-oscilloscope/'
              return index === 0 ? '/' : pathname.substring(0, index) + '/';
            }
          }
        } catch (error: unknown) {
          // URL parsing failed - skip this script and try next one
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.debug('Failed to parse script URL:', src, error);
          }
          continue;
        }
      }
    }
    return '';
  }
}
