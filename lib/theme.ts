export const THEME_STORAGE_KEY = "upiqr-theme";

/**
 * Runs before paint to apply the saved or system theme and avoid a flash of
 * the wrong colour scheme. Kept outside the client component so the server
 * layout can inline it.
 */
export const themeInitScript = `(function(){try{var stored=localStorage.getItem("${THEME_STORAGE_KEY}");var dark=stored==="dark"||(!stored&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
