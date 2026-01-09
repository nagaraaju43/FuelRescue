import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Github, Chrome, Fuel } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const validate = () => {
    let newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
      console.log("Logged in with:", formData);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] p-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        {/* Branding/Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-green-500/10 rounded-2xl mb-4 border border-green-500/20">
            <Fuel className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            FuelRescue
          </h1>
          <p className="text-gray-400 text-sm">Emergency Fuel Request System</p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">User Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                </div>
                <input
                  required
                  type="email"
                  className="block w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all"
                  placeholder="Enter your email"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-green-400 hover:text-green-300"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                </div>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-700 text-black font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-gray-900/50 text-gray-500 font-medium">
                Or log in with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white text-sm font-medium transition-colors">
              <Chrome size={18} />
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white text-sm font-medium transition-colors">
              <Github size={18} />
              GitHub
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-gray-500 mt-8 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-400 font-bold hover:underline underline-offset-4"
          >
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
