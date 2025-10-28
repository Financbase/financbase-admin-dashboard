"use client";

import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle, Users } from "lucide-react";

export function TrustIndicators() {
  const indicators = [
    {
      icon: Shield,
      label: "Security-First Design",
      description: "256-bit encryption",
    },
    {
      icon: Lock,
      label: "Industry Standards",
      description: "Enterprise security",
    },
    {
      icon: CheckCircle,
      label: "Privacy-Focused",
      description: "Data protection",
    },
    {
      icon: Users,
      label: "Growing Community",
      description: "Trusted by businesses",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <span>Trusted by financial professionals</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {indicators.map((indicator, index) => (
          <motion.div
            key={indicator.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20"
          >
            <indicator.icon className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-xs font-medium text-gray-900">
                {indicator.label}
              </div>
              <div className="text-xs text-gray-600">
                {indicator.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
