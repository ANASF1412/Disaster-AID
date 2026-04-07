import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "volunteer" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    const result = await register(form);
    if (result.success) {
      toast.success("Account created!");
      navigate("/dashboard");
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50 to-surface-100 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
            <AlertTriangle size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create Account</h1>
          <p className="text-surface-500 dark:text-slate-400 mt-1 text-sm">Join the relief coordination network</p>
        </div>

        <div className="card p-8 shadow-xl shadow-surface-200/50 dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Full name</label>
              <input className="input" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} className="input pr-10" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="volunteer">Volunteer</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </button>

            {apiError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
