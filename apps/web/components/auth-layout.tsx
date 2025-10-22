"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
}

export function AuthLayout({
  children,
  brandTitle = "AllowBox",
  brandSubtitle = "Get access to comprehensive school management tools you can't find anywhere else"
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2">
        <div className="relative bg-black flex flex-col justify-center items-center text-white overflow-hidden w-full p-12">
          {/* Animated gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradientMove opacity-60" />

          {/* Subtle glowing circles */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-radial from-indigo-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-purple-600/20 to-transparent rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 text-center space-y-4 px-6 max-w-md">
            <h1 className="text-5xl font-bold tracking-tight">{brandTitle}</h1>
            <p className="text-gray-300 text-lg">
              {brandSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
