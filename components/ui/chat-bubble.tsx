/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
  message: string;
  sender: string;
  timestamp: string;
  isOwn?: boolean;
}

export function ChatBubble({ message, sender, timestamp, isOwn = false }: ChatBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={`/avatars/${sender.toLowerCase()}.jpg`} />
          <AvatarFallback>{sender.charAt(0)}</AvatarFallback>
        </Avatar>
        <Card className={isOwn ? 'bg-primary text-primary-foreground' : ''}>
          <CardContent className="p-3">
            <p className="text-sm">{message}</p>
            <p className="text-xs opacity-70 mt-1">{timestamp}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface VoiceChatProps {
  users: Array<{ id: string; name: string; avatarUrl?: string; isSpeaking?: boolean }>;
  onJoin?: () => void;
}

export function VoiceChat({ users, onJoin }: VoiceChatProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {users.map((user) => (
          <Avatar key={user.id} className="h-12 w-12">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {onJoin && <button onClick={onJoin}>Join Chat</button>}
    </div>
  );
}
