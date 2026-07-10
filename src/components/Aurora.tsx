import React from "react";
import { cn } from "@/lib/utils";

interface AuroraProps extends React.HTMLAttributes<HTMLDivElement> {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
}

export const Aurora = ({
  className,
  colorStops = ["#ff003745", "#00f83273", "#ffa600b9"],
  ...props
}: AuroraProps) => {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden bg-slate-50", className)} {...props}>
      <div
        className="absolute w-[300vw] h-[300vw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.48] blur-[100px] filter"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, ${colorStops[0]}, ${colorStops[1]}, ${colorStops[2]}, ${colorStops[0]})`,
          animation: "spin 10s linear infinite",
        }}
      />
      <div
        className="absolute w-[300vw] h-[300vw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.48] blur-[100px] filter"
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
