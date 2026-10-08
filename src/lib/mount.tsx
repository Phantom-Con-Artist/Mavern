import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";

/** Render a page into #root. Each HTML entry calls this once. */
export function mount(page: ReactNode) {
  createRoot(document.getElementById("root")!).render(<StrictMode>{page}</StrictMode>);
}
