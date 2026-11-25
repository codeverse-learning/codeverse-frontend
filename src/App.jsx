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
import AiLearningHistory from "./pages/AiLearningHistory";
import CodeTimeMachine from "./pages/CodeTimeMachine";
import LivePlayground from "./pages/LivePlayground";

// Study Packs Feature
import StudyPacks from "./features/study-packs/pages/StudyPacks";

import AnimationEngine from "./components/visual-learning/AnimationEngine";
import VisualLearningStudio from "./components/visual-learning/VisualLearningStudio";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/github/callback"
          element={<GithubCallback />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/code-time-machine"
            element={<CodeTimeMachine />}
          />

          <Route
            path="/code-explainer"
            element={<CodeExplainer />}
          />

          <Route
            path="/visual-learning"
            element={<VisualLearningStudio />}
          />

          <Route
            path="/ai/history"
            element={<AiLearningHistory />}
          />

          {/* AI Study Packs */}
          <Route
            path="/study-packs"
            element={<StudyPacks />}
          />

          {/* Course Learning */}
          <Route
            path="/learn/:courseId"
            element={<CourseLearning />}
          />

          {/* Live Code Playground */}
          <Route
            path="/live-playground"
            element={<LivePlayground />}
          />

        </Route>

        {/* Animation Development Test */}
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