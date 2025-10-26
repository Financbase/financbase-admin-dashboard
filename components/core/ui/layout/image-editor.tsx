"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
	RotateCw,
	RotateCcw,
	Crop,
	Undo2,
	Redo2,
	Download,
	Save,
	Sun,
	Monitor,
	Palette,
	Focus,
	Filter,
	Move,
	ZoomIn,
	ZoomOut,
	FlipHorizontal,
	FlipVertical,
	Settings,
	X
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ImageEditorProps {
	imageUrl: string;
	imageName?: string;
	onSave?: (editedImageUrl: string, metadata?: any) => void;
	onCancel?: () => void;
	className?: string;
}

interface EditOperation {
	type: 'crop' | 'rotate' | 'flip' | 'filter' | 'adjust';
	params: any;
	timestamp: number;
}

interface FilterPreset {
	name: string;
	brightness: number;
	contrast: number;
	saturation: number;
	blur: number;
	hue?: number;
	sepia?: number;
	grayscale?: number;
}

const FILTER_PRESETS: FilterPreset[] = [
	{ name: 'Original', brightness: 0, contrast: 0, saturation: 0, blur: 0 },
	{ name: 'Vintage', brightness: -10, contrast: 20, saturation: -20, sepia: 30 },
	{ name: 'Black & White', brightness: 0, contrast: 10, saturation: -100, grayscale: 100 },
	{ name: 'Sepia', brightness: -5, contrast: 15, saturation: -10, sepia: 60 },
	{ name: 'High Contrast', brightness: 0, contrast: 40, saturation: 0 },
	{ name: 'Soft Focus', brightness: 5, contrast: -10, saturation: 10, blur: 1 },
	{ name: 'Vivid', brightness: 0, contrast: 20, saturation: 30 },
	{ name: 'Matte', brightness: -5, contrast: 10, saturation: -15, grayscale: 20 },
];

export function ImageEditor({
	imageUrl,
	imageName = 'edited-image',
	onSave,
	onCancel,
	className = '',
}: ImageEditorProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	// Image state
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

	// Edit state
	const [rotation, setRotation] = useState(0);
	const [flipH, setFlipH] = useState(false);
	const [flipV, setFlipV] = useState(false);
	const [brightness, setBrightness] = useState(0);
	const [contrast, setContrast] = useState(0);
	const [saturation, setSaturation] = useState(0);
	const [blur, setBlur] = useState(0);
	const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

	// History state
	const [history, setHistory] = useState<EditOperation[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	// UI state
	const [activeTool, setActiveTool] = useState<'crop' | 'adjust' | 'filter' | null>(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });

	// Load image
	React.useEffect(() => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			setImage(img);
			setOriginalImage(img);
			setIsLoading(false);
		};
		img.onerror = () => {
			toast.error('Failed to load image');
			setIsLoading(false);
		};
		img.src = imageUrl;
	}, [imageUrl]);

	// Apply edits to canvas
	const applyEdits = useCallback(() => {
		if (!image || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const { width, height } = image;

		// Set canvas size to match image
		canvas.width = width;
		canvas.height = height;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Save context state
		ctx.save();

		// Apply transformations
		ctx.translate(width / 2, height / 2);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
		ctx.translate(-width / 2, -height / 2);

		// Apply crop if active
		if (cropArea) {
			const { x, y, width: cropWidth, height: cropHeight } = cropArea;
			ctx.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, width, height);
		} else {
			ctx.drawImage(image, 0, 0, width, height);
		}

		// Restore context
		ctx.restore();

		// Apply filters
		if (brightness !== 0 || contrast !== 0 || saturation !== 0 || blur !== 0) {
			const imageData = ctx.getImageData(0, 0, width, height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				// Brightness
				data[i] = Math.max(0, Math.min(255, data[i] + brightness));
				data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
				data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));

				// Contrast
				if (contrast !== 0) {
					const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
					data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
					data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
					data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
				}

				// Saturation (simplified)
				if (saturation !== 0) {
					const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
					const satFactor = 1 + saturation / 100;
					data[i] = Math.max(0, Math.min(255, gray + (data[i] - gray) * satFactor));
					data[i + 1] = Math.max(0, Math.min(255, gray + (data[i + 1] - gray) * satFactor));
					data[i + 2] = Math.max(0, Math.min(255, gray + (data[i + 2] - gray) * satFactor));
				}
			}

			// Apply blur if needed (simplified box blur)
			if (blur > 0) {
				const blurRadius = Math.floor(blur);
				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						let r = 0, g = 0, b = 0, count = 0;
						for (let dy = -blurRadius; dy <= blurRadius; dy++) {
							for (let dx = -blurRadius; dx <= blurRadius; dx++) {
								const nx = x + dx;
								const ny = y + dy;
								if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
									const idx = (ny * width + nx) * 4;
									r += data[idx];
									g += data[idx + 1];
									b += data[idx + 2];
									count++;
								}
							}
						}
						const idx = (y * width + x) * 4;
						data[idx] = r / count;
						data[idx + 1] = g / count;
						data[idx + 2] = b / count;
					}
				}
			}

			ctx.putImageData(imageData, 0, 0);
		}
	}, [image, rotation, flipH, flipV, brightness, contrast, saturation, blur, cropArea]);

	// Add operation to history
	const addToHistory = useCallback((operation: EditOperation) => {
		const newHistory = history.slice(0, historyIndex + 1);
		newHistory.push(operation);
		setHistory(newHistory);
		setHistoryIndex(newHistory.length - 1);
		setCanUndo(newHistory.length > 1);
		setCanRedo(false);
	}, [history, historyIndex]);

	// Undo operation
	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			const operation = history[newIndex];

			// Revert operation
			switch (operation.type) {
				case 'rotate':
					setRotation(prev => prev - operation.params.angle);
					break;
				case 'flip':
					if (operation.params.horizontal) setFlipH(prev => !prev);
					if (operation.params.vertical) setFlipV(prev => !prev);
					break;
				case 'adjust':
					setBrightness(operation.params.previousBrightness || 0);
					setContrast(operation.params.previousContrast || 0);
					setSaturation(operation.params.previousSaturation || 0);
					setBlur(operation.params.previousBlur || 0);
					break;
				case 'crop':
					setCropArea(operation.params.previousCrop);
					break;
			}

			setHistoryIndex(newIndex);
			setCanRedo(true);
			setCanUndo(newIndex > 0);
		}
	}, [historyIndex, history]);

	// Redo operation
	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			const operation = history[newIndex];

			// Apply operation
			switch (operation.type) {
				case 'rotate':
					setRotation(prev => prev + operation.params.angle);
					break;
				case 'flip':
					if (operation.params.horizontal) setFlipH(prev => !prev);
					if (operation.params.vertical) setFlipV(prev => !prev);
					break;
				case 'adjust':
					setBrightness(operation.params.brightness);
					setContrast(operation.params.contrast);
					setSaturation(operation.params.saturation);
					setBlur(operation.params.blur);
					break;
				case 'crop':
					setCropArea(operation.params.crop);
					break;
			}

			setHistoryIndex(newIndex);
			setCanRedo(newIndex < history.length - 1);
			setCanUndo(true);
		}
	}, [historyIndex, history]);

	// Rotation functions
	const rotateClockwise = () => {
		const newRotation = (rotation + 90) % 360;
		setRotation(newRotation);
		addToHistory({
			type: 'rotate',
			params: { angle: 90, previousRotation: rotation },
			timestamp: Date.now()
		});
	};

	const rotateCounterClockwise = () => {
		const newRotation = (rotation - 90 + 360) % 360;
		setRotation(newRotation);
		addToHistory({
			type: 'rotate',
			params: { angle: -90, previousRotation: rotation },
			timestamp: Date.now()
		});
	};

	// Flip functions
	const flipHorizontal = () => {
		setFlipH(prev => !prev);
		addToHistory({
			type: 'flip',
			params: { horizontal: true, previousFlipH: !flipH },
			timestamp: Date.now()
		});
	};

	const flipVertical = () => {
		setFlipV(prev => !prev);
		addToHistory({
			type: 'flip',
			params: { vertical: true, previousFlipV: !flipV },
			timestamp: Date.now()
		});
	};

	// Apply filter preset
	const applyFilterPreset = (preset: FilterPreset) => {
		const previousValues = { brightness, contrast, saturation, blur };

		setBrightness(preset.brightness);
		setContrast(preset.contrast);
		setSaturation(preset.saturation);
		setBlur(preset.blur);

		addToHistory({
			type: 'adjust',
			params: {
				brightness: preset.brightness,
				contrast: preset.contrast,
				saturation: preset.saturation,
				blur: preset.blur,
				previousBrightness: previousValues.brightness,
				previousContrast: previousValues.contrast,
				previousSaturation: previousValues.saturation,
				previousBlur: previousValues.blur
			},
			timestamp: Date.now()
		});
	};

	// Save edited image
	const saveImage = async () => {
		if (!canvasRef.current) return;

		setIsSaving(true);
		try {
			const canvas = canvasRef.current;
			canvas.toBlob(async (blob) => {
				if (blob && onSave) {
					// Convert to base64 or upload to storage
					const reader = new FileReader();
					reader.onload = () => {
						const base64 = reader.result as string;
						onSave(base64, {
							originalName: imageName,
							operations: history.slice(0, historyIndex + 1),
							metadata: {
								rotation,
								flipH,
								flipV,
								brightness,
								contrast,
								saturation,
								blur,
								cropArea,
								appliedAt: new Date().toISOString()
							}
						});
					};
					reader.readAsDataURL(blob);
				}
			}, 'image/jpeg', 0.9);
		} catch (error) {
			toast.error('Failed to save image');
		} finally {
			setIsSaving(false);
		}
	};

	// Download image
	const downloadImage = () => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const link = document.createElement('a');
		link.download = `edited-${imageName}.jpg`;
		link.href = canvas.toDataURL();
		link.click();
		toast.success('Image downloaded');
	};

	// Reset all edits
	const resetImage = () => {
		setRotation(0);
		setFlipH(false);
		setFlipV(false);
		setBrightness(0);
		setContrast(0);
		setSaturation(0);
		setBlur(0);
		setCropArea(null);
		setHistory([]);
		setHistoryIndex(-1);
		setCanUndo(false);
		setCanRedo(false);
		toast.success('Image reset to original');
	};

	// Apply edits whenever state changes
	React.useEffect(() => {
		applyEdits();
	}, [applyEdits]);

	if (isLoading) {
		return (
			<Card className={`w-full ${className}`}>
				<CardContent className="p-6">
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
							<p>Loading image editor...</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={`w-full ${className}`}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Image Editor
						<Badge variant="secondary">Beta</Badge>
					</CardTitle>

					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
							<Undo2 className="h-4 w-4 mr-1" />
							Undo
						</Button>
						<Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}>
							<Redo2 className="h-4 w-4 mr-1" />
							Redo
						</Button>
						<Button variant="outline" size="sm" onClick={resetImage}>
							Reset
						</Button>
						<Button variant="outline" size="sm" onClick={downloadImage}>
							<Download className="h-4 w-4 mr-1" />
							Download
						</Button>
						<Button
							variant="default"
							size="sm"
							onClick={saveImage}
							disabled={isSaving}
						>
							{isSaving ? (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
							) : (
								<Save className="h-4 w-4 mr-1" />
							)}
							Save
						</Button>
						{onCancel && (
							<Button variant="outline" size="sm" onClick={onCancel}>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Toolbar */}
				<div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
					{/* Rotation Tools */}
					<div className="flex gap-1">
						<Button
							variant={activeTool === 'crop' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setActiveTool(activeTool === 'crop' ? null : 'crop')}
						>
							<Crop className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={rotateClockwise}>
							<RotateCw className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={rotateCounterClockwise}>
							<RotateCcw className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={flipHorizontal}>
							<FlipHorizontal className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={flipVertical}>
							<FlipVertical className="h-4 w-4" />
						</Button>
					</div>

					{/* Filter Presets */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Filter className="h-4 w-4 mr-1" />
								Filters
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-48">
							{FILTER_PRESETS.map(preset => (
								<DropdownMenuItem
									key={preset.name}
									onClick={() => applyFilterPreset(preset)}
								>
									{preset.name}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Adjustment Tools */}
					<Button
						variant={activeTool === 'adjust' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setActiveTool(activeTool === 'adjust' ? null : 'adjust')}
					>
						<Brightness className="h-4 w-4" />
					</Button>
				</div>

				{/* Image Canvas */}
				<div className="relative border rounded-lg overflow-hidden bg-muted">
					<canvas
						ref={canvasRef}
						className="max-w-full h-auto"
						style={{
							maxHeight: '70vh',
							transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
							transformOrigin: 'center'
						}}
					/>
					{!image && (
						<div className="absolute inset-0 flex items-center justify-center">
							<p className="text-muted-foreground">Loading image...</p>
						</div>
					)}
				</div>

				{/* Adjustment Controls */}
				{activeTool === 'adjust' && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Brightness className="h-4 w-4" />
								Brightness
							</label>
							<Slider
								value={[brightness]}
								onValueChange={(value) => setBrightness(value[0])}
								min={-100}
								max={100}
								step={1}
								className="w-full"
							/>
							<span className="text-xs text-muted-foreground">{brightness}</span>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Contrast className="h-4 w-4" />
								Contrast
							</label>
							<Slider
								value={[contrast]}
								onValueChange={(value) => setContrast(value[0])}
								min={-100}
								max={100}
								step={1}
								className="w-full"
							/>
							<span className="text-xs text-muted-foreground">{contrast}</span>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Saturation</label>
							<Slider
								value={[saturation]}
								onValueChange={(value) => setSaturation(value[0])}
								min={-100}
								max={100}
								step={1}
								className="w-full"
							/>
							<span className="text-xs text-muted-foreground">{saturation}</span>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Blur className="h-4 w-4" />
								Blur
							</label>
							<Slider
								value={[blur]}
								onValueChange={(value) => setBlur(value[0])}
								min={0}
								max={5}
								step={0.1}
								className="w-full"
							/>
							<span className="text-xs text-muted-foreground">{blur.toFixed(1)}</span>
						</div>
					</div>
				)}

				{/* Crop Controls */}
				{activeTool === 'crop' && (
					<div className="p-4 border rounded-lg">
						<p className="text-sm text-muted-foreground mb-3">
							Crop functionality coming soon. Use rotation and flip tools for now.
						</p>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" disabled>
								Apply Crop
							</Button>
							<Button variant="outline" size="sm" onClick={() => setActiveTool(null)}>
								Cancel
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
