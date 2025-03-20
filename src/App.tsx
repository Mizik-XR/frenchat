
import { React } from "@/core/ReactInstance";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Routes from "@/Routes";
import { ReactErrorMonitor } from "@/components/monitoring/ReactErrorMonitor";
import { APIErrorHandler } from "@/components/debug/APIErrorHandler";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <ReactErrorMonitor />
      <APIErrorHandler />
      <Router>
        <Routes />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
