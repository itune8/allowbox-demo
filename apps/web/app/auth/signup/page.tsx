"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService, type RegisterSchoolDto } from "../../../lib/services/auth.service";

// Validation schema
const registerSchoolSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
  domain: z
    .string()
    .min(3, "Domain must be at least 3 characters")
    .max(50, "Domain must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Domain can only contain lowercase letters, numbers, and hyphens")
    .refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Domain cannot start or end with a hyphen"),
  address: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().optional(),
  adminFirstName: z.string().min(2, "First name must be at least 2 characters"),
  adminLastName: z.string().min(2, "Last name must be at least 2 characters"),
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterSchoolFormData = z.infer<typeof registerSchoolSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterSchoolFormData>({
    resolver: zodResolver(registerSchoolSchema),
  });

  const schoolName = watch("schoolName");

  const onSubmit = async (data: RegisterSchoolFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = data;

      const response = await authService.registerSchool(registrationData as RegisterSchoolDto);

      setSuccess(true);

      // Show success message and redirect to login
      setTimeout(() => {
        router.push(`/auth/login?registered=true&email=${encodeURIComponent(data.contactEmail)}`);
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to register school. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gray-50 bg-clip-text text-transparent">
                AllowBox
              </h1>
              <p className="text-sm text-gray-600 mt-1">School Management System</p>
            </div>
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Already have an account? <span className="font-semibold">Sign in</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Success Message */}
          {success && (
            <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Registration Successful!</h3>
                  <p className="text-sm text-green-800">
                    Your school has been successfully registered. Redirecting you to login...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Register Your School
            </h2>
            <p className="text-lg text-gray-600">
              Start your journey with AllowBox School Management System
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">
            {/* School Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">School Information</h3>
              </div>

              {/* School Name */}
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("schoolName")}
                  id="schoolName"
                  type="text"
                  placeholder="e.g., ABC International School"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.schoolName
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.schoolName && (
                  <p className="mt-1 text-sm text-red-600">{errors.schoolName.message}</p>
                )}
              </div>

              {/* Domain */}
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                  School Domain <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("domain")}
                    id="domain"
                    type="text"
                    placeholder="abc-school"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all pr-32 ${
                      errors.domain
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <div className="absolute right-3 top-3 text-sm text-gray-500">.allowbox.app</div>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Your unique school identifier (lowercase letters, numbers, and hyphens only)
                </p>
                {errors.domain && (
                  <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  School Address
                </label>
                <textarea
                  {...register("address")}
                  id="address"
                  placeholder="Complete address including street, city, state, and PIN code"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("contactEmail")}
                  id="contactEmail"
                  type="email"
                  placeholder="admin@abcschool.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.contactEmail
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <p className="mt-1.5 text-xs text-gray-500">This will be your admin login email</p>
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  {...register("contactPhone")}
                  id="contactPhone"
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Admin Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Account</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="adminFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("adminFirstName")}
                    id="adminFirstName"
                    type="text"
                    placeholder="John"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.adminFirstName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.adminFirstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.adminFirstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("adminLastName")}
                    id="adminLastName"
                    type="text"
                    placeholder="Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.adminLastName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.adminLastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.adminLastName.message}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("adminPassword")}
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.adminPassword
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
                {errors.adminPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.adminPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full py-4 bg-gray-50 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register School"
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-gray-500">
              By registering, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-gray-600">
            Need help?{" "}
            <a href="mailto:support@allowbox.com" className="text-blue-600 hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
