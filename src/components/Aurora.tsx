import React from "react";
import { cn } from "@/lib/utils";

interface AuroraProps extends React.HTMLAttributes<HTMLDivElement> {
  colorStops?: string[];
}

export const Aurora = ({
  className,
  colorStops = ["#5e60cecc", "#6830c3d4", "#7500b8d3"],
  ...props
}: AuroraProps) => {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden bg-slate-50", className)} {...props}>
      <div
        className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-100 blur-[150px] mix-blend-multiply"
        style={{
          background: `radial-gradient(circle, ${colorStops[0]} 0%, transparent 70%)`,
          animation: "float1 3s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute top-[20%] right-[-20%] w-[70%] h-[70%] rounded-full opacity-100 blur-[150px] mix-blend-multiply"
        style={{
          background: `radial-gradient(circle, ${colorStops[1]} 0%, transparent 70%)`,
          animation: "float2 3s ease-in-out infinite alternate-reverse",
        }}
      />
      <div
        className="absolute bottom-[20%] left-[10%] w-[80%] h-[80%] rounded-full opacity-70 blur-[150px] mix-blend-multiply"
        style={{
          background: `radial-gradient(circle, ${colorStops[2]} 0%, transparent 70%)`,
          animation: "float3 3s ease-in-out infinite alternate",
        }}
      />
      <style>{`
        @keyframes float1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(10%, 15%) scale(1.1); }
        }
        @keyframes float2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-15%, 10%) scale(0.9); }
        }
        @keyframes float3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(15%, -15%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};
