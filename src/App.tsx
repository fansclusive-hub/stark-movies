import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import MoviesPage from "./pages/MoviesPage";
import TVShowsPage from "./pages/TVShowsPage";
import AnimePage from "./pages/AnimePage";
import WatchMoviePage from "./pages/WatchMoviePage";
import WatchTVPage from "./pages/WatchTVPage";
import WatchAnimePage from "./pages/WatchAnimePage";
import NotFound from "./pages/NotFound";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";
import DevToolsBlocker from "./components/DevToolsBlocker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DevToolsBlocker />
      <Toaster />
      <Sonner />
      <HoverReceiver />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search/:searchTerm" element={<SearchPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVShowsPage />} />
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/movie/:id" element={<WatchMoviePage />} />
          <Route path="/tv/:id/:season/:episode" element={<WatchTVPage />} />
          <Route path="/tv/:id" element={<WatchTVPage />} />
          <Route path="/anime/:id/:episode/:type" element={<WatchAnimePage />} />
          <Route path="/anime/:id" element={<WatchAnimePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;