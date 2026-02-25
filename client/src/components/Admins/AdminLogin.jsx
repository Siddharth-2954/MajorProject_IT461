import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function AdminLogin() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [touched, setTouched] = useState({});
	const [fieldErrors, setFieldErrors] = useState({});

	const navigate = useNavigate();
	const { login, setUser } = useContext(AuthContext) || {};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setTouched({ username: true, password: true });

		const errs = validateAll();
		setFieldErrors(errs);
		if (Object.keys(errs).length) return;
		setLoading(true);

		try {
			// If an AuthContext.login exists, use it. Otherwise, fall back to a simple fetch to server.
			if (typeof login === "function") {
				await login({ username, password });
				navigate("/admin");
				return;
			}

			const url = API_BASE.replace(/\/$/, "") + "/admin/!login";
			console.log('Attempting login to:', url);  // Debug log
			
			const resp = await fetch(url, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			console.log('Response status:', resp.status);  // Debug log

			if (!resp.ok) {
				const data = await resp.json().catch(() => ({}));
				throw new Error(data.error || data.message || "Login failed");
			}

			const data = await resp.json().catch(() => ({}));
			console.log('Login response:', data);  // Debug log
			
			// update auth context if available
			if (setUser && data && data.admin) setUser(data.admin);

			// server may suggest redirect path
			const redirect = (data && data.adminRedirect) || "/admin";
			navigate(redirect);
		} catch (err) {
			console.error('Login error:', err);  // Debug log
			setError(err.message || "Failed to connect to server. Please ensure the server is running.");
		} finally {
			setLoading(false);
		}
	};

	const validateAll = () => {
		const errs = {};
		if (!username || !username.trim()) errs.username = "Username is required.";
		if (!password) errs.password = "Password is required.";
		else if (password.length < 6)
			errs.password = "Password must be at least 6 characters.";
		return errs;
	};

	const handleBlur = (field) => {
		setTouched((t) => ({ ...t, [field]: true }));
		const errs = validateAll();
		setFieldErrors(errs);
	};

	const isFormValid = Object.keys(validateAll()).length === 0;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
				<h2 className="text-2xl font-semibold mb-6 text-center">Admin Login</h2>
				{error && (
					<div className="mb-4 text-sm text-red-600 border border-red-100 bg-red-50 p-2 rounded">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} noValidate>
					<label className="block mb-2 text-sm font-medium text-gray-700">
						Username
					</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						onBlur={() => handleBlur("username")}
						className={`w-full mb-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-400 ${
							touched.username && fieldErrors.username ? "border-red-400" : ""
						}`}
						placeholder="admin username"
					/>
					{touched.username && fieldErrors.username && (
						<div className="text-sm text-red-600 mb-3">{fieldErrors.username}</div>
					)}

					<label className="block mb-2 text-sm font-medium text-gray-700">
						Password
					</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onBlur={() => handleBlur("password")}
						className={`w-full mb-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-400 ${
							touched.password && fieldErrors.password ? "border-red-400" : ""
						}`}
						placeholder="password"
					/>
					{touched.password && fieldErrors.password && (
						<div className="text-sm text-red-600 mb-4">{fieldErrors.password}</div>
					)}

					<button
						type="submit"
						disabled={loading || !isFormValid}
						className={`w-full text-white py-2 rounded transition ${
							loading || !isFormValid
								? "bg-gray-400 cursor-not-allowed"
								: "bg-sky-600 hover:bg-sky-700"
						}`}
					>
						{loading ? "Logging in..." : "Log in"}
					</button>
				</form>
			</div>
		</div>
	);
}