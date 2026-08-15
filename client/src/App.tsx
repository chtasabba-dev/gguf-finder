/* Dark Arabic Console / app shell: lightweight query-based privacy route for GitHub Pages. */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Privacy from "@/pages/Privacy";

export default function App() {
  const isPrivacy = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("page") === "privacy";
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster />{isPrivacy ? <Privacy /> : <Home />}</TooltipProvider></ThemeProvider></ErrorBoundary>;
}
