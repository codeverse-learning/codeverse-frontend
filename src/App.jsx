
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GithubCallback from "./pages/GithubCallback";
import CourseLearning from "./pages/CourseLearning";
import CodeExplainer from "./pages/CodeExplainer";

import AnimationEngine from "./components/visual-learning/AnimationEngine";
import VisualLearningStudio from "./components/visual-learning/VisualLearningStudio";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* GitHub OAuth Callback */}
        <Route
          path="/github/callback"
          element={<GithubCallback />}
        />

        {/* Protected Pages */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Student Course Learning */}
          <Route
            path="/learn/:courseId"
            element={<CourseLearning />}
          />

          {/* AI Visual Learning Studio */}
          <Route
            path="/visual-learning"
            element={<VisualLearningStudio />}
          />
        </Route>

        {/* AI Code Explainer */}
        <Route
          path="/code-explainer"
          element={<CodeExplainer />}
        />

        {/* Animation Test Page */}
        <Route
          path="/animation-test"
          element={
            <div className="min-h-screen bg-[#080812] p-6">
              <div className="mx-auto max-w-4xl">
                <AnimationEngine />
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
