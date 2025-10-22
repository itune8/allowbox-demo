"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "../../../lib/api-client";
import { env } from "@repo/config";
import { AuthLayout } from "../../../components/auth-layout";

type Step = "request" | "verify" | "reset";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	const [step, setStep] = useState<Step>("request");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);
	const [mockOtp, setMockOtp] = useState<string | null>(null);

	const OTP_API_URL = process.env.NEXT_PUBLIC_OTP_API_URL;

	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(t);
	}, []);

	const handleRequestOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setInfo(null);

		if (!email.trim()) {
			setError("Email is required.");
			return;
		}

		try {
			setLoading(true);
			if (env.useApiMocks) {
				const code = "123456";
				setMockOtp(code);
				setInfo(`OTP sent to ${email}. (Mock code: ${code})`);
				setStep("verify");
				return;
			}
			await apiClient.post( "/auth/forgot-password", { email }, { baseURL: OTP_API_URL || undefined } );
			setInfo(`OTP sent to ${email}. Please check your inbox.`);
			setStep("verify");
		} catch (e: unknown) {
			const err = e as { response?: { data?: { message?: string } }; message?: string };
			setError(err?.response?.data?.message || err?.message || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setInfo(null);

		if (!otp.trim()) {
			setError("OTP is required.");
			return;
		}

		try {
			setLoading(true);
			if (env.useApiMocks) {
				if (otp === mockOtp) {
					setStep("reset");
					setInfo("OTP verified. Set your new password.");
				} else {
					setError("Invalid OTP (mock mode).");
				}
				return;
			}
			await apiClient.post( "/auth/verify-otp", { email, otp }, { baseURL: OTP_API_URL || undefined } );
			setStep("reset");
			setInfo("OTP verified. Set your new password.");
		} catch (e: unknown) {
			const err = e as { response?: { data?: { message?: string } }; message?: string };
			setError(err?.response?.data?.message || err?.message || "OTP verification failed");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setInfo(null);

		if (newPassword.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		try {
			setLoading(true);
			if (env.useApiMocks) {
				setInfo("Password reset successful (mock). Redirecting to login...");
				setTimeout(() => router.replace("/auth/login"), 1000);
				return;
			}
			await apiClient.post( "/auth/reset-password", { email, otp, password: newPassword }, { baseURL: OTP_API_URL || undefined } );
			setInfo("Password reset successful. Redirecting to login...");
			setTimeout(() => router.replace("/auth/login"), 1000);
		} catch (e: unknown) {
			const err = e as { response?: { data?: { message?: string } }; message?: string };
			setError(err?.response?.data?.message || err?.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<div
				className={`transition-all duration-500 ease-out ${
					mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
				}`}
			>
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-2">
						{step === "request" && "Forgot Password"}
						{step === "verify" && "Verify OTP"}
						{step === "reset" && "Reset Password"}
					</h2>
					<p className="text-sm text-gray-600">
						{step === "request" && "Enter your email to receive an OTP"}
						{step === "verify" && "Enter the code sent to your email"}
						{step === "reset" && "Create a new password for your account"}
					</p>
				</div>

				{error && (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						{error}
					</div>
				)}
				{info && (
					<div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
						{info}
					</div>
				)}

				{step === "request" && (
					<form onSubmit={handleRequestOtp} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								id="email"
								type="email"
								placeholder="you@example.com"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete="email"
								required
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 font-medium"
						>
							{loading ? "Sending..." : "Send OTP"}
						</button>
						<div className="text-center text-sm">
							<Link href="/auth/login" className="text-gray-600 hover:text-gray-900 hover:underline">
								Back to login
							</Link>
						</div>
					</form>
				)}

				{step === "verify" && (
					<form onSubmit={handleVerifyOtp} className="space-y-4">
						<div>
							<label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
								OTP Code
							</label>
							<input
								id="otp"
								type="text"
								inputMode="numeric"
								placeholder="Enter 6-digit code"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest text-center text-lg"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								required
								minLength={4}
								maxLength={8}
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 font-medium"
						>
							{loading ? "Verifying..." : "Verify OTP"}
						</button>
						<div className="text-center text-sm">
							<button
								type="button"
								onClick={() => {
									setStep("request");
									setError(null);
									setInfo(null);
								}}
								className="text-gray-600 hover:text-gray-900 hover:underline"
							>
								Resend OTP
							</button>
						</div>
					</form>
				)}

				{step === "reset" && (
					<form onSubmit={handleResetPassword} className="space-y-4">
						<div>
							<label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
								New Password
							</label>
							<input
								id="new-password"
								type="password"
								placeholder="••••••••"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								autoComplete="new-password"
								required
								minLength={6}
							/>
						</div>
						<div>
							<label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
								Confirm Password
							</label>
							<input
								id="confirm-password"
								type="password"
								placeholder="••••••••"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								autoComplete="new-password"
								required
								minLength={6}
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 font-medium"
						>
							{loading ? "Resetting..." : "Reset Password"}
						</button>
					</form>
				)}
			</div>
		</AuthLayout>
	);
}

