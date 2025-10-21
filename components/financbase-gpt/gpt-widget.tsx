"use client";

/**
 * Financbase GPT Widget
 * Floating chat widget for easy access to AI assistant
 */

import { useState } from 'react';
import { Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinancbaseGPTChat } from './gpt-chat-interface';
import { cn } from '@/lib/utils';

interface GPTWidgetProps {
	defaultOpen?: boolean;
	position?: 'bottom-right' | 'bottom-left';
}

export function FinancbaseGPTWidget({ 
	defaultOpen = false,
	position = 'bottom-right',
}: GPTWidgetProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const [isMinimized, setIsMinimized] = useState(false);

	const positionClasses = {
		'bottom-right': 'bottom-6 right-6',
		'bottom-left': 'bottom-6 left-6',
	};

	return (
		<>
			{/* Floating Button */}
			{!isOpen && (
				<Button
					onClick={() => setIsOpen(true)}
					className={cn(
						'fixed z-50 rounded-full w-14 h-14 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110',
						positionClasses[position]
					)}
					size="icon"
				>
					<Bot className="h-6 w-6" />
					<span className="sr-only">Open Financbase GPT</span>
				</Button>
			)}

			{/* Chat Panel */}
			{isOpen && (
				<div
					className={cn(
						'fixed z-50 shadow-2xl rounded-lg overflow-hidden transition-all duration-300',
						positionClasses[position],
						isMinimized ? 'w-80 h-16' : 'w-96'
					)}
					style={{ 
						height: isMinimized ? '64px' : '600px',
						maxHeight: 'calc(100vh - 100px)',
					}}
				>
					{isMinimized ? (
						// Minimized Header
						<div className="bg-card border h-full flex items-center justify-between px-4">
							<div className="flex items-center gap-2">
								<Bot className="h-5 w-5 text-primary" />
								<span className="font-semibold text-sm">Financbase GPT</span>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => setIsMinimized(false)}
								>
									<Maximize2 className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => setIsOpen(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>
					) : (
						// Full Chat Interface
						<div className="relative h-full">
							{/* Custom Header with Controls */}
							<div className="absolute top-0 right-0 z-10 flex items-center gap-1 p-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 bg-background/80 backdrop-blur-sm"
									onClick={() => setIsMinimized(true)}
								>
									<Minimize2 className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 bg-background/80 backdrop-blur-sm"
									onClick={() => setIsOpen(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Chat Interface */}
							<FinancbaseGPTChat
								className="h-full border-0"
								showHeader={true}
								showQuickActions={true}
								maxHeight="100%"
							/>
						</div>
					)}
				</div>
			)}
		</>
	);
}

