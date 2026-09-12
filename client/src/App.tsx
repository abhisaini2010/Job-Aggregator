import { BrowserRouter, Routes, Route } from "react-router-dom";

import Jobs from "./pages/Jobs";
import JobDetails from "./pages/jobs/JobDetails";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

import { AuthProvider } from "./context/AuthContext";

import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Resume from "./pages/resume/Resume";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          <Route path="/" element={<Jobs />} />

          <Route element={<PublicRoute />}>

  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/signup"
    element={<Signup />}
  />

</Route>
          <Route path="/jobs" element={<Jobs />} />

          <Route
            path="/jobs/:id"
            element={<JobDetails />}
          />


          {/* =========================
              PROTECTED ROUTES
          ========================= */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/saved-jobs"
              element={<SavedJobs />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/applications"
              element={<Applications />}
            />

            <Route
              path="/resume"
              element={<Resume />}
            />

          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;