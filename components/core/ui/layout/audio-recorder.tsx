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
import { MicrophoneWaveform } from "@/components/ui/waveform";
import { cn } from "@/lib/utils";
import {
  Mic,
  Pause,
  Square,
  RotateCcw,
  Download,
  Save,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from '@/lib/logger';

interface AudioRecorderProps {
	timesheetEntryId?: string;
	onRecordingComplete?: (audioData: {
		audioUrl: string;
		duration: number;
		transcript?: string;
	}) => void;
	onRecordingSave?: (audioData: {
		audioUrl: string;
		duration: number;
		transcript?: string;
	}) => void;
	maxDuration?: number; // in seconds
	className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
	timesheetEntryId,
	onRecordingComplete,
	onRecordingSave,
	maxDuration = 300, // 5 minutes default
	className,
}) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [recordedAudio, setRecordedAudio] = useState<{
		blob: Blob;
		url: string;
		duration: number;
	} | null>(null);
	const [recordingDuration, setRecordingDuration] = useState(0);
	const [transcript, setTranscript] = useState<string>("");
	const [error, setError] = useState<string>("");

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const startTimeRef = useRef<number>(0);
	const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const startRecording = useCallback(async () => {
		try {
			setError("");
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 44100,
				},
			});

			streamRef.current = stream;
			audioChunksRef.current = [];

			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "audio/webm;codecs=opus",
			});

			mediaRecorderRef.current = mediaRecorder;
			startTimeRef.current = Date.now();

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, {
					type: "audio/webm",
				});
				const audioUrl = URL.createObjectURL(audioBlob);

				setRecordedAudio({
					blob: audioBlob,
					url: audioUrl,
					duration: recordingDuration,
				});

				setIsRecording(false);
				setIsPaused(false);
				setRecordingDuration(0);

				// Stop all tracks
				stream.getTracks().forEach((track) => track.stop());

				onRecordingComplete?.({
					audioUrl,
					duration: recordingDuration,
					transcript,
				});
			};

			mediaRecorder.start(100); // Collect data every 100ms
			setIsRecording(true);
			setIsPaused(false);

			// Start duration tracking
			durationIntervalRef.current = setInterval(() => {
				const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
				setRecordingDuration(elapsed);

				if (elapsed >= maxDuration) {
					stopRecording();
				}
			}, 100);
		} catch (error) {
			logger.error("Error starting recording:", error);
			setError(
				"Failed to start recording. Please check microphone permissions.",
			);
		}
	}, [maxDuration, onRecordingComplete, transcript]);

	const pauseRecording = useCallback(() => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === "recording"
		) {
			mediaRecorderRef.current.pause();
			setIsPaused(true);

			if (durationIntervalRef.current) {
				clearInterval(durationIntervalRef.current);
				durationIntervalRef.current = null;
			}
		}
	}, []);

	const resumeRecording = useCallback(() => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === "paused"
		) {
			mediaRecorderRef.current.resume();
			setIsPaused(false);
			startTimeRef.current = Date.now() - recordingDuration * 1000;

			durationIntervalRef.current = setInterval(() => {
				const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
				setRecordingDuration(elapsed);

				if (elapsed >= maxDuration) {
					stopRecording();
				}
			}, 100);
		}
	}, [recordingDuration, maxDuration]);

	const stopRecording = useCallback(() => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state !== "inactive"
		) {
			mediaRecorderRef.current.stop();
			setIsProcessing(true);

			if (durationIntervalRef.current) {
				clearInterval(durationIntervalRef.current);
				durationIntervalRef.current = null;
			}

			// Processing state will be cleared when onstop fires
		}
	}, []);

	const resetRecording = useCallback(() => {
		if (recordedAudio) {
			URL.revokeObjectURL(recordedAudio.url);
		}

		setRecordedAudio(null);
		setRecordingDuration(0);
		setTranscript("");
		setIsProcessing(false);
		setError("");

		if (durationIntervalRef.current) {
			clearInterval(durationIntervalRef.current);
			durationIntervalRef.current = null;
		}
	}, [recordedAudio]);

	const saveRecording = useCallback(async () => {
		if (!recordedAudio || !timesheetEntryId) return;

		try {
			setError("");

			// Generate filename
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const fileName = `recording-${timestamp}.webm`;

			// Get upload URL
			const uploadResponse = await fetch("/api/audio/upload", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fileName,
					fileType: recordedAudio.blob.type,
				}),
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to get upload URL");
			}

			const uploadData = await uploadResponse.json();

			// Upload file to storage
			const uploadResponse2 = await fetch(uploadData.uploadUrl, {
				method: "PUT",
				body: recordedAudio.blob,
				headers: {
					"Content-Type": recordedAudio.blob.type,
				},
			});

			if (!uploadResponse2.ok) {
				throw new Error("Failed to upload audio file");
			}

			// Update timesheet entry with audio data
			await fetch(`/api/freelance/timesheets/${timesheetEntryId}/audio`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					audioUrl: uploadData.uploadUrl,
					duration: recordedAudio.duration,
					transcript,
				}),
			});

			onRecordingSave?.({
				audioUrl: uploadData.uploadUrl,
				duration: recordedAudio.duration,
				transcript,
			});

			resetRecording();
		} catch (error) {
			logger.error("Error saving recording:", error);
			setError("Failed to save recording. Please try again.");
		}
	}, [
		recordedAudio,
		timesheetEntryId,
		transcript,
		onRecordingSave,
		resetRecording,
	]);

	const downloadRecording = useCallback(() => {
		if (!recordedAudio) return;

		const url = URL.createObjectURL(recordedAudio.blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `recording-${new Date().toISOString().slice(0, 19)}.webm`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [recordedAudio]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (recordedAudio) {
				URL.revokeObjectURL(recordedAudio.url);
			}
			if (durationIntervalRef.current) {
				clearInterval(durationIntervalRef.current);
			}
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
			}
		};
	}, [recordedAudio]);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Audio Recording</span>
					{recordedAudio && (
						<Badge variant="secondary">
							{formatDuration(recordedAudio.duration)}
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Waveform Visualization */}
				<div className="relative">
					<MicrophoneWaveform
						active={isRecording && !isPaused}
						processing={isProcessing}
						height={120}
						barWidth={3}
						barGap={2}
						barRadius={2}
						fadeEdges={true}
						sensitivity={1.5}
						onError={(error: Error) => setError(error.message)}
					/>

					{/* Recording Indicator Overlay */}
					{(isRecording || isProcessing) && (
						<div className="absolute inset-0 bg-red-500/10 rounded-lg flex items-center justify-center">
							<div className="text-center">
								<div className="animate-pulse">
									<Mic className="h-8 w-8 text-red-500 mx-auto mb-2" />
								</div>
								<div className="text-sm font-mono text-red-600">
									{isProcessing
										? "Processing..."
										: formatDuration(recordingDuration)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Error Message */}
				{error && (
					<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
						{error}
					</div>
				)}

				{/* Controls */}
				<div className="flex flex-wrap gap-2">
					{!isRecording && !recordedAudio ? (
						<Button onClick={startRecording} className="flex-1">
							<Mic className="mr-2 h-4 w-4" />
							Start Recording
						</Button>
					) : isRecording && !isPaused ? (
						<>
							<Button
								onClick={pauseRecording}
								variant="outline"
								className="flex-1"
							>
								<Pause className="mr-2 h-4 w-4" />
								Pause
							</Button>
							<Button
								onClick={stopRecording}
								variant="destructive"
								className="flex-1"
							>
								<Square className="mr-2 h-4 w-4" />
								Stop
							</Button>
						</>
					) : isRecording && isPaused ? (
						<>
							<Button onClick={resumeRecording} className="flex-1">
								<Mic className="mr-2 h-4 w-4" />
								Resume
							</Button>
							<Button
								onClick={stopRecording}
								variant="destructive"
								className="flex-1"
							>
								<Square className="mr-2 h-4 w-4" />
								Stop
							</Button>
						</>
					) : recordedAudio ? (
						<>
							<Button
								onClick={resetRecording}
								variant="outline"
								className="flex-1"
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Record Again
							</Button>
							<Button
								onClick={downloadRecording}
								variant="outline"
								className="flex-1"
							>
								<Download className="mr-2 h-4 w-4" />
								Download
							</Button>
							{timesheetEntryId && (
								<Button onClick={saveRecording} className="flex-1">
									<Save className="mr-2 h-4 w-4" />
									Save to Entry
								</Button>
							)}
						</>
					) : null}
				</div>

				{/* Transcript Input */}
				{recordedAudio && (
					<div className="space-y-2">
						<label className="text-sm font-medium">Transcript (Optional)</label>
						<textarea
							value={transcript}
							onChange={(e) => setTranscript(e.target.value)}
							placeholder="Add a transcript or notes about this recording..."
							className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
							rows={3}
						/>
					</div>
				)}

				{/* Progress Bar for Max Duration */}
				{isRecording && (
					<div className="space-y-2">
						<div className="flex justify-between text-sm text-gray-600">
							<span>Duration</span>
							<span>
								{formatDuration(recordingDuration)} /{" "}
								{formatDuration(maxDuration)}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-red-500 h-2 rounded-full transition-all duration-100"
								style={{
									width: `${Math.min(100, (recordingDuration / maxDuration) * 100)}%`,
								}}
							/>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
