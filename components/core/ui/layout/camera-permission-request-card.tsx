/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import {
	AlertCircle,
	AlertTriangle,
	Bell,
	Code,
	Headphones,
	Settings,
	Video,
	XCircle,
} from "lucide-react";

import { useCameraPermission } from "@/hooks/use-camera-permission";
import {
	Camera,
	CameraOff,
	CheckCircle,
	HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { logger } from '@/lib/logger';

interface CameraPermissionCardProps {
	onPermissionChange?: (granted: boolean) => void;
	showInstructions?: boolean;
	className?: string;
}

export const Component = ({
	onPermissionChange,
	showInstructions = true,
	className,
}: CameraPermissionCardProps) => {
	const [hasInteracted, setHasInteracted] = useState(false);

	const {
		status,
		isLoading,
		error,
		isSupported,
		requestPermission,
		resetError,
	} = useCameraPermission({
		onPermissionChange: (newStatus: PermissionState) => {
			const granted = newStatus === "granted";
			onPermissionChange?.(granted);
		},
		onError: (errorMessage: string) => {
			logger.error("Camera permission error:", errorMessage);
		},
	});

	// Save permission preference to API when status changes
	useEffect(() => {
		if (status !== "prompt" && hasInteracted) {
			const savePreference = async () => {
				try {
					await fetch("/api/settings/camera-permission", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							cameraAccess: status === "granted",
							lastUpdated: new Date().toISOString(),
						}),
					});
				} catch (error) {
					logger.error("Failed to save camera permission preference:", error);
				}
			};

			savePreference();
		}
	}, [status, hasInteracted]);

	const handleRequestPermission = async () => {
		setHasInteracted(true);
		await requestPermission();
	};

	const handleRetry = () => {
		resetError();
		setHasInteracted(false);
	};

	// Show error state
	if (error) {
		return (
			<Card
				className={`flex w-full max-w-[500px] flex-col rounded-[14px] bg-muted/40 p-[4px] shadow-none ${className}`}
			>
				<CardContent className="relative flex flex-col items-center justify-center overflow-hidden rounded-[10px] bg-background p-0 ring-1 ring-border">
					<div className="z-10 flex w-full flex-col items-center justify-center gap-4.5 px-6 py-8 text-center">
						<div className="rounded-full bg-destructive/10 p-3">
							<AlertCircle className="size-8 text-destructive" />
						</div>
						<div className="flex max-w-96 flex-col gap-1.5">
							<CardTitle className="text-lg">Camera Access Failed</CardTitle>
							<CardDescription className="tracking-[-0.006em]">
								{error}
							</CardDescription>
						</div>
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Please check your browser settings and ensure no other
								applications are using the camera.
							</AlertDescription>
						</Alert>
						<Button onClick={handleRetry} variant="outline">
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show unsupported state
	if (!isSupported) {
		return (
			<Card
				className={`flex w-full max-w-[500px] flex-col rounded-[14px] bg-muted/40 p-[4px] shadow-none ${className}`}
			>
				<CardContent className="relative flex flex-col items-center justify-center overflow-hidden rounded-[10px] bg-background p-0 ring-1 ring-border">
					<div className="z-10 flex w-full flex-col items-center justify-center gap-4.5 px-6 py-8 text-center">
						<div className="rounded-full bg-warning/10 p-3">
							<CameraOff className="size-8 text-warning" />
						</div>
						<div className="flex max-w-96 flex-col gap-1.5">
							<CardTitle className="text-lg">Camera Not Supported</CardTitle>
							<CardDescription className="tracking-[-0.006em]">
								Your browser or device doesn't support camera access. Please use
								a modern browser or device with camera capabilities.
							</CardDescription>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show granted state
	if (status === "granted") {
		return (
			<Card
				className={`flex w-full max-w-[500px] flex-col rounded-[14px] bg-muted/40 p-[4px] shadow-none ${className}`}
			>
				<CardContent className="relative flex flex-col items-center justify-center overflow-hidden rounded-[10px] bg-background p-0 ring-1 ring-border">
					<div className="z-10 flex w-full flex-col items-center justify-center gap-4.5 px-6 py-8 text-center">
						<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
							<CheckCircle className="size-8 text-green-600 dark:text-green-400" />
						</div>
						<div className="flex max-w-96 flex-col gap-1.5">
							<CardTitle className="text-lg text-green-700 dark:text-green-300">
								Camera Access Granted
							</CardTitle>
							<CardDescription className="tracking-[-0.006em]">
								You can now use camera features for video calls and photos.
							</CardDescription>
						</div>
						<div className="relative w-full overflow-hidden rounded-xl bg-green-50 dark:bg-green-900/10 p-6 ring-1 ring-green-200 dark:ring-green-800 ring-inset">
							<div className="flex items-center gap-3">
								<div className="size-3 rounded-full bg-green-500 animate-pulse" />
								<span className="text-sm font-medium text-green-700 dark:text-green-300">
									Camera is ready to use
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show permission request state
	return (
		<Card
			className={`flex w-full max-w-[500px] flex-col rounded-[14px] bg-muted/40 p-[4px] shadow-none ${className}`}
		>
			<CardContent className="relative flex flex-col items-center justify-center overflow-hidden rounded-[10px] bg-background p-0 ring-1 ring-border">
				<div className="z-10 flex w-full flex-col items-center justify-center gap-4.5 px-6 py-8 text-center">
					<img
						src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=48&h=48&fit=crop&crop=center"
						alt="camera icon"
						className="size-12 rounded-xl"
					/>
					<div className="flex max-w-96 flex-col gap-1.5">
						<CardTitle className="text-lg">
							Camera permission required
						</CardTitle>
						<CardDescription className="tracking-[-0.006em]">
							To make video calls, please turn on the camera permission in your
							browser by clicking the notification.
						</CardDescription>
					</div>

					<div className="relative w-full overflow-hidden rounded-xl bg-accent/70 p-6 ring-1 ring-border ring-inset dark:bg-popover">
						<div className="ml-8 grid w-full grid-cols-[70px_1fr] overflow-hidden rounded-xl bg-card ring-1 ring-border drop-shadow-xl">
							<div className="relative flex h-full w-full items-center justify-center overflow-hidden border-r bg-[repeating-linear-gradient(-60deg,var(--color-border)_0_0.5px,transparent_0.5px_8px)]">
								<img
									src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=64&h=64&fit=crop&crop=center"
									alt="camera icon"
									className="ml-10 size-16 rounded-xl"
								/>
								<span className="absolute top-3 left-3 size-[11px] rounded-full bg-gradient-to-b from-green-600 via-green-500 to-green-400 inset-shadow-sm inset-shadow-green-300" />
							</div>
							<div className="flex flex-col gap-2 p-4">
								<div className="flex flex-col gap-0.5 text-left">
									<h3 className="text-sm font-medium tracking-[-0.006em]">
										Allow camera access
									</h3>
									<p className="text-xs tracking-[-0.006em] text-muted-foreground">
										Allow camera access to make video calls
									</p>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="link"
										size="sm"
										className="p-0 text-xs text-muted-foreground"
										onClick={() => setHasInteracted(true)}
									>
										Deny
									</Button>
									<Button
										variant="link"
										size="sm"
										className="p-0 text-xs"
										onClick={handleRequestPermission}
										disabled={isLoading}
									>
										{isLoading ? "Requesting..." : "Allow"}
									</Button>
								</div>
							</div>
						</div>
					</div>

					{showInstructions && (
						<Accordion
							type="single"
							collapsible
							className="w-full"
							defaultValue="item-1"
						>
							<AccordionItem
								value="item-1"
								className="ring-1 ring-border dark:bg-popover"
							>
								<AccordionTrigger className="text-sm dark:bg-popover">
									<div className="flex items-center gap-1.5">
										<HelpCircle className="size-4 text-muted-foreground" />
										Step-by-step guide
									</div>
								</AccordionTrigger>
								<AccordionContent>
									<ol className="ml-9.5 list-decimal space-y-2 text-left tracking-[-0.006em]">
										<li>
											Click the{" "}
											<span className="inline-flex items-center gap-1 font-bold">
												camera icon
												<Camera className="size-4" />
											</span>{" "}
											in your browser's address bar.
										</li>
										<li>
											Select <span className="font-bold">Allow</span> when
											prompted for camera access.
										</li>
										<li>
											If you don't see a prompt, click the{" "}
											<Button
												variant="link"
												size="sm"
												className="p-0 text-xs h-auto"
												onClick={handleRequestPermission}
											>
												Allow
											</Button>{" "}
											button above.
										</li>
										<li>Your camera is now ready to use!</li>
									</ol>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					)}
				</div>
				<div className="z-10 flex w-full items-center justify-between border-t bg-background px-6 py-4">
					<Button variant="outline" onClick={() => setHasInteracted(true)}>
						Skip for now
					</Button>
					<Button onClick={handleRequestPermission} disabled={isLoading}>
						{isLoading ? "Requesting..." : "Continue"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
