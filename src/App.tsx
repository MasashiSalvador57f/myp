import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import SettingsPage from "./pages/SettingsPage";

// エディタページはエディタ担当チームが実装
// ここでは遅延インポートでスタブとして扱う
import Editor from "./pages/Editor";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route
          path="/project/:projectId/editor/:fileId?"
          element={<Editor />}
        />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
