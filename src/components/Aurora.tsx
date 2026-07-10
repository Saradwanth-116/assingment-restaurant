import React from 'react';
import { cn } from "@/lib/utils";

interface AuroraProps extends React.HTMLAttributes<HTMLDivElement> {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
}

export const Aurora = ({
  className,
  colorStops = ["#ff00a28f", "#00f832ff", "#ffa600ff"],
  ...props
}: AuroraProps) => {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden bg-slate-50", className)} {...props}>
      <div
        className="absolute -inset-[50%] opacity-[0.48] blur-[100px] filter"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, ${colorStops[0]}, ${colorStops[1]}, ${colorStops[2]}, ${colorStops[0]})`,
          animation: "spin 10s linear infinite",
        }}
      />
      <div
        className="absolute -inset-[50%] opacity-[0.48] blur-[100px] filter"
        style={{
          background: `conic-gradient(from 270deg at 50% 50%, ${colorStops[2]}, ${colorStops[1]}, ${colorStops[0]}, ${colorStops[2]})`,
          animation: "spin 30s linear infinite reverse",
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
