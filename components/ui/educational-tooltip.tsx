import React from "react";

interface EducationalTooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export function EducationalTooltip({ children, content, placement = "top" }: EducationalTooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${placement === "top" ? "bottom-full mb-2" : placement === "bottom" ? "top-full mt-2" : placement === "left" ? "right-full mr-2" : "left-full ml-2"} hidden group-hover:block bg-gray-900 text-white text-sm rounded px-2 py-1 whitespace-nowrap z-50`}>
        {content}
      </div>
    </div>
  );
}
