// Runs before first paint so the saved reading theme applies without a flash. Keep in step with src/hooks/useTheme.ts.
try {
  var saved = localStorage.getItem("mavern-theme");
  var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = /^(paper|ink|warm)$/.test(saved) ? saved : dark ? "ink" : "paper";
} catch (e) {
  document.documentElement.dataset.theme = "paper";
}
