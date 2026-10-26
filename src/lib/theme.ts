export const THEME_STORAGE_KEY = "theme";

/**
 * Runs before first paint (see the root layout) so the stored theme, or the
 * OS preference, is resolved into the `.dark` class without a light flash.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var stored=localStorage.getItem("${THEME_STORAGE_KEY}");var dark=stored?stored==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var root=document.documentElement;root.classList.toggle("dark",dark);root.style.colorScheme=dark?"dark":"light";}catch(error){}})();`;
