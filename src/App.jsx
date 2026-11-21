
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
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Student Course Learning */}
          <Route
            path="/learn/:courseId"
            element={<CourseLearning />}
          />
        </Route>

        {/* Code Explainer */}
        <Route
          path="/code-explainer"
          element={<CodeExplainer />}
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
