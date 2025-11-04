/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface AudioPlaybackProps {
	audioUrl: string;
	duration?: number; // in seconds
	transcript?: string;
	title?: string;
	showTranscript?: boolean;
	showControls?: boolean;
	showProgress?: boolean;
	showVolume?: boolean;
	autoPlay?: boolean;
	onDelete?: () => void;
	onDownload?: () => void;
	className?: string;
}

export const AudioPlayback: React.FC<AudioPlaybackProps> = ({
	audioUrl,
	duration,
	transcript,
	title,
	showTranscript = true,
	showControls = true,
	showProgress = true,
	showVolume = true,
	autoPlay = false,
	onDelete,
	onDownload,
	className,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	const audioRef = useRef<HTMLAudioElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleLoadedMetadata = () => {
			setIsLoading(false);
			if (duration === undefined) {
				// Update duration from audio metadata if not provided
				setDuration(audio.duration);
			}
		};

		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
		};

		const handleError = () => {
			setError("Failed to load audio file");
			setIsLoading(false);
		};

		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("error", handleError);

		return () => {
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("error", handleError);
		};
	}, [duration]);

	useEffect(() => {
		if (autoPlay && audioRef.current) {
			audioRef.current.play().catch(() => {
				// Auto-play was prevented, ignore
			});
		}
	}, [autoPlay]);

	const togglePlayPause = async () => {
		const audio = audioRef.current;
		if (!audio) return;

		try {
			if (isPlaying) {
				audio.pause();
				setIsPlaying(false);
			} else {
				await audio.play();
				setIsPlaying(true);
			}
		} catch (error) {
			console.error("Error playing audio:", error);
			setError("Failed to play audio");
		}
	};

	const handleSeek = (value: number[]) => {
		const audio = audioRef.current;
		if (!audio) return;

		const newTime = (value[0] / 100) * audio.duration;
		audio.currentTime = newTime;
		setCurrentTime(newTime);
	};

	const handleVolumeChange = (value: number[]) => {
		const audio = audioRef.current;
		if (!audio) return;

		const newVolume = value[0] / 100;
		audio.volume = newVolume;
		setVolume(newVolume);
		setIsMuted(newVolume === 0);
	};

	const toggleMute = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isMuted) {
			audio.volume = volume;
			setIsMuted(false);
		} else {
			audio.volume = 0;
			setIsMuted(true);
		}
	};

	const restart = () => {
		const audio = audioRef.current;
		if (!audio) return;

		audio.currentTime = 0;
		setCurrentTime(0);
		if (isPlaying) {
			audio.play();
		}
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center justify-between text-lg">
					<span>{title || "Audio Recording"}</span>
					{duration && (
						<Badge variant="outline" className="text-xs">
							<Clock className="mr-1 h-3 w-3" />
							{formatTime(duration)}
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Hidden audio element */}
				<audio ref={audioRef} src={audioUrl} preload="metadata" />

				{/* Error Message */}
				{error && (
					<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
						{error}
					</div>
				)}

				{/* Progress Bar */}
				{showProgress && (
					<div className="space-y-2">
						<div className="flex justify-between text-sm text-gray-600">
							<span>{formatTime(currentTime)}</span>
							<span>{formatTime(duration || 0)}</span>
						</div>
						<div className="relative">
							<Progress
								value={progressPercentage}
								className="h-2 cursor-pointer"
								onClick={(e) => {
									if (!progressRef.current) return;
									const rect = progressRef.current.getBoundingClientRect();
									const clickX = e.clientX - rect.left;
									const percentage = (clickX / rect.width) * 100;
									handleSeek([percentage]);
								}}
								ref={progressRef}
							/>
						</div>
					</div>
				)}

				{/* Controls */}
				{showControls && (
					<div className="flex items-center justify-center space-x-2">
						<Button
							onClick={restart}
							variant="outline"
							size="sm"
							disabled={isLoading}
						>
							<RotateCcw className="h-4 w-4" />
						</Button>

						<Button
							onClick={togglePlayPause}
							disabled={isLoading || !!error}
							size="lg"
						>
							{isLoading ? (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
							) : isPlaying ? (
								<Pause className="h-5 w-5" />
							) : (
								<Play className="h-5 w-5" />
							)}
						</Button>

						{onDownload && (
							<Button onClick={onDownload} variant="outline" size="sm">
								<Download className="h-4 w-4" />
							</Button>
						)}

						{onDelete && (
							<Button
								onClick={onDelete}
								variant="outline"
								size="sm"
								className="text-red-500"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				)}

				{/* Volume Control */}
				{showVolume && (
					<div className="flex items-center space-x-2">
						<Button
							onClick={toggleMute}
							variant="ghost"
							size="sm"
							className="px-2"
						>
							{isMuted || volume === 0 ? (
								<VolumeX className="h-4 w-4" />
							) : (
								<Volume2 className="h-4 w-4" />
							)}
						</Button>
						<div className="flex-1">
							<Slider
								value={[isMuted ? 0 : volume * 100]}
								onValueChange={handleVolumeChange}
								max={100}
								step={1}
								className="w-full"
							/>
						</div>
						<span className="text-sm text-gray-500 w-8">
							{Math.round((isMuted ? 0 : volume) * 100)}%
						</span>
					</div>
				)}

				{/* Transcript */}
				{showTranscript && transcript && (
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-gray-700">Transcript</h4>
						<div className="p-3 bg-gray-50 rounded-md">
							<p className="text-sm text-gray-800">{transcript}</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
