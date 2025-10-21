import React from "react";
import { Card, CardContent } from "./card";

interface ProfileCardProps {
  name: string;
  role: string;
  avatar?: string;
  description?: string;
  className?: string;
}

export function ProfileCard({ name, role, avatar, description, className }: ProfileCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {avatar && (
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-gray-600">{role}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}