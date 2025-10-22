"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { env } from "@repo/config";
import { apiClient } from "../../../lib/api-client";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import Image from "next/image";
import { AuthLayout } from "../../../components/auth-layout";

type Board = { id: string; name: string };

const DEFAULT_BOARDS: Board[] = [
	{ id: "cbse", name: "CBSE" },
	{ id: "icse", name: "ICSE" },
	{ id: "ib", name: "IB" },
	{ id: "state", name: "State Board" },
];

const CLASS_OPTIONS = [
	"Nursery",
	"KG",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
] as const;

export default function SchoolOnboardingPage() {
	const router = useRouter();

	const [mounted, setMounted] = useState(false);
	const [boards, setBoards] = useState<Board[]>(DEFAULT_BOARDS);
	const [loadingBoards, setLoadingBoards] = useState(false);

	const [schoolName, setSchoolName] = useState("");
	const [address, setAddress] = useState("");
	const [highestClass, setHighestClass] = useState<(typeof CLASS_OPTIONS)[number]>("10");
	const [boardId, setBoardId] = useState("cbse");
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);

	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		if (!logoFile) {
			setLogoPreview(null);
			return;
		}
		const url = URL.createObjectURL(logoFile);
		setLogoPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [logoFile]);

	useEffect(() => {
		async function fetchBoards() {
			if (env.useApiMocks) return; // keep defaults
			try {
				setLoadingBoards(true);
				// Optional real API call if available
				const data = await apiClient.get<Board[]>("/boards").catch(() => DEFAULT_BOARDS);
				if (Array.isArray(data) && data.length) setBoards(data);
			} finally {
				setLoadingBoards(false);
			}
		}
		fetchBoards();
	}, []);

	const classesOffered = useMemo(() => {
		const idx = CLASS_OPTIONS.indexOf(highestClass);
		return CLASS_OPTIONS.slice(0, idx + 1);
	}, [highestClass]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setInfo(null);

		if (!schoolName.trim()) {
			setError("School name is required.");
			return;
		}
		if (!address.trim()) {
			setError("Address is required.");
			return;
		}

		try {
			setSubmitting(true);
			const payload = {
				schoolName,
				address,
				highestClass,
				classesOffered,
				boardId,
				logoProvided: Boolean(logoFile),
			};

			if (env.useApiMocks) {
				localStorage.setItem("schoolOnboarding", JSON.stringify(payload));
				setInfo("Onboarding saved (mock). Redirecting to login...");
				setTimeout(() => router.replace("/auth/login"), 1000);
				return;
			}

			// If the backend expects multipart form
			const form = new FormData();
			Object.entries(payload).forEach(([k, v]) => {
				form.append(k, typeof v === "string" ? v : JSON.stringify(v));
			});
			if (logoFile) form.append("logo", logoFile);

			await apiClient.post("/schools/onboarding", form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setInfo("Onboarding complete. Redirecting to login...");
			setTimeout(() => router.replace("/auth/login"), 1000);
		} catch (err: unknown) {
			const e = err as { response?: { data?: { message?: string } }; message?: string };
			setError(e?.response?.data?.message || e?.message || "Failed to submit onboarding");
		} finally {
			setSubmitting(false);
		}
	};

	return (
			<AuthLayout brandTitle="AllowBox" brandSubtitle="Set up your school in minutes — modern tools for seamless operations">
				<div className="w-full max-w-3xl">
					<form onSubmit={handleSubmit}>
					<div
						className={`transition-all duration-500 ease-out ${
							mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
						}`}
					>
						{/* Progress Steps */}
							<div className="mb-10">
							<div className="flex items-center justify-center gap-3 mb-6">
								<div className="flex items-center gap-2">
										<div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
										1
									</div>
									<span className="text-sm font-medium text-gray-900">School Details</span>
								</div>
								<div className="w-12 h-px bg-gray-300"></div>
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center text-sm font-medium">
										2
									</div>
									<span className="text-sm text-gray-400">Complete</span>
								</div>
							</div>
							<div className="text-center">
									<h2 className="text-3xl font-bold text-gray-900 mb-2">Set up your school</h2>
									<p className="text-gray-600">Tell us about your school to get started</p>
							</div>
						</div>

						{/* Alerts */}
						{error && (
							<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
								<p className="text-sm text-red-800">{error}</p>
							</div>
						)}
						{info && (
							<div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
								<p className="text-sm text-blue-800">{info}</p>
							</div>
						)}

						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">Highest Class Offered</label>
							<RadioGroup value={highestClass} onValueChange={(v: string) => setHighestClass(v as (typeof CLASS_OPTIONS)[number])} className="grid grid-cols-3 gap-3">
								{CLASS_OPTIONS.map((opt) => (
									<label key={opt} className="px-3 py-2 rounded-md border hover:bg-gray-50 inline-flex items-center gap-2 cursor-pointer">
										<RadioGroupItem value={opt} />
										<span className="text-sm">{opt}</span>
									</label>
								))}
							</RadioGroup>
							<p className="mt-2 text-xs text-gray-600">Classes from Nursery up to {highestClass} will be created.</p>
						</div>

						<div>
							<label htmlFor="school-name" className="block text-sm font-medium text-gray-700 mb-2">
								School Name <span className="text-red-500">*</span>
							</label>
							<input
								id="school-name"
								type="text"
								placeholder="Enter your school name"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
								value={schoolName}
								onChange={(e) => setSchoolName(e.target.value)}
								required
							/>
						</div>

						<div>
							<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
								School Address <span className="text-red-500">*</span>
							</label>
							<textarea
								id="address"
								placeholder="Enter complete address including street, city, state, and PIN code"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white min-h-[100px] resize-none"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								required
							/>
						</div>

						{/* Academic Information Section */}
									<div className="bg-gray-50 rounded-xl p-8 space-y-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3">
									Education Board <span className="text-red-500">*</span>
								</label>
								<select
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
									value={boardId}
									onChange={(e) => setBoardId(e.target.value)}
									disabled={loadingBoards}
								>
									{boards.map((b) => (
										<option key={b.id} value={b.id}>{b.name}</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3">
									Highest Class Offered <span className="text-red-500">*</span>
								</label>
								<RadioGroup
									value={highestClass}
									onValueChange={(v) => setHighestClass(v as (typeof CLASS_OPTIONS)[number])}
									className="grid grid-cols-6 gap-2"
								>
									{CLASS_OPTIONS.map((opt) => (
										<RadioGroupItem
											key={opt}
											value={opt}
											className="px-3 py-2 rounded-lg border border-gray-300 hover:border-black hover:bg-gray-50 transition-colors"
										>
											<span className="text-sm font-medium">{opt}</span>
										</RadioGroupItem>
									))}
								</RadioGroup>
								<p className="mt-3 text-xs text-gray-500">
									All classes from Nursery to {highestClass} will be created for your school
								</p>
							</div>
						</div>

						{/* School Logo Section */}
									<div className="bg-gray-50 rounded-xl p-8">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">School Logo</h3>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Upload Logo <span className="text-gray-500">(Optional)</span>
							</label>
							<div className="flex items-center gap-6">
								<div className="flex-1">
									<input
										type="file"
										accept="image/*"
										onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
										className="block w-full text-sm text-gray-600
											file:mr-4 file:py-2.5 file:px-4
											file:rounded-lg file:border file:border-gray-300
											file:text-sm file:font-medium
											file:bg-white file:text-gray-700
											hover:file:bg-gray-50 file:transition-colors
											cursor-pointer"
									/>
									<p className="mt-2 text-xs text-gray-500">PNG, JPG or JPEG (Max 5MB)</p>
								</div>
								{logoPreview && (
									<div className="shrink-0">
										<Image
											src={logoPreview}
											alt="Logo preview"
											width={80}
											height={80}
											unoptimized
											className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
										/>
									</div>
								)}
							</div>
						</div>

						{/* Actions */}
									<div className="flex items-center justify-between pt-4">
							<Link
								href="/auth/login"
								className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
							>
								← Back to login
							</Link>
							<button
								type="submit"
								disabled={submitting}
								className="px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{submitting ? "Setting up..." : "Continue"}
							</button>
						</div>
						</div>
							</form>
							{/* Footer */}
							<div className="max-w-4xl mx-auto px-6 py-6">
								<p className="text-center text-sm text-gray-500">
									Need help? Contact our support team at <a href="mailto:support@allowbox.com" className="text-gray-900 hover:underline">support@allowbox.com</a>
								</p>
							</div>
						</div>
					</AuthLayout>
	);
}
