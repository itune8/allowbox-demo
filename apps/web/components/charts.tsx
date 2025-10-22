"use client";

import React from "react";

type Point = { x: number; y: number };

function scalePoints(values: number[], w: number, h: number, pad = 12): Point[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / Math.max(values.length - 1, 1);
  return values.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + (h - pad * 2) * (1 - (v - min) / range),
  }));
}

export function AreaChart({
  data,
  width = 520,
  height = 200,
  gradientId = "areaGradient",
  stroke = "#6366f1",
  fillFrom = "#6366f1",
  fillTo = "#93c5fd",
  className = "",
  labels,
}: {
  data: number[];
  width?: number;
  height?: number;
  gradientId?: string;
  stroke?: string;
  fillFrom?: string;
  fillTo?: string;
  className?: string;
  labels?: string[];
}) {
  const pts = scalePoints(data, width, height);
  const path = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${pts[0]?.x ?? 0},${height - 12} L ${path} L ${pts[pts.length - 1]?.x ?? 0},${height - 12} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fillTo} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <rect x="0" y={height - 12} width={width} height="1" fill="#eef2ff" />
      {/* area */}
      <path d={area} fill={`url(#${gradientId})`} />
      {/* line */}
      <polyline points={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={stroke} />
      ))}
      {/* x labels (optional) */}
      {labels?.length === data.length && (
        <g>
          {pts.map((p, i) => (
            <text key={i} x={p.x} y={height - 2} textAnchor="middle" fontSize={10} fill="#9ca3af">
              {labels[i]}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}

export function LineChart({
  data,
  width = 520,
  height = 200,
  stroke = "#10b981",
  className = "",
  labels,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
  labels?: string[];
}) {
  const pts = scalePoints(data, width, height);
  const path = pts.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      {/* baseline */}
      <rect x="0" y={height - 12} width={width} height="1" fill="#e5e7eb" />
      {/* line */}
      <polyline points={path} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={stroke} />
      ))}
      {/* x labels (optional) */}
      {labels?.length === data.length && (
        <g>
          {pts.map((p, i) => (
            <text key={i} x={p.x} y={height - 2} textAnchor="middle" fontSize={10} fill="#9ca3af">
              {labels[i]}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
