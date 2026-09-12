import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authApi";

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await loginUser(email, password);
      await refreshUser();
      setSuccess("Login successful!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message || "Failed to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-gray-600">
          Login to your account
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

         
       {/* Password */}
<div>
  <label className="mb-1 block text-sm font-medium text-gray-700">
    Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
      required
      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 outline-none focus:border-blue-500"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? "🙈" : "👁️"}
    </button>
  </div>
</div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;