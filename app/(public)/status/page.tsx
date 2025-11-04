"use client";

import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard } from "@/components/layout/public-section";
import {
	CheckCircle2,
	XCircle,
	AlertCircle,
	RefreshCw,
	Database,
	Server,
	Globe,
	Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HealthStatus {
	status: string;
	timestamp: string;
	services?: {
		database?: { status: string; responseTime?: number };
		api?: { status: string; responseTime?: number };
		[key: string]: { status: string; responseTime?: number } | undefined;
	};
	uptime?: number;
	version?: string;
	error?: string;
}

export default function StatusPage() {
	const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [autoRefresh, setAutoRefresh] = useState(true);

	const fetchHealthStatus = async () => {
		try {
			const response = await fetch('/api/v1/health');
			const data = await response.json();
			setHealthStatus(data);
			setLastUpdated(new Date());
		} catch (error) {
			setHealthStatus({
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : 'Failed to fetch health status',
			});
			setLastUpdated(new Date());
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchHealthStatus();

		if (autoRefresh) {
			const interval = setInterval(fetchHealthStatus, 60000); // Refresh every minute
			return () => clearInterval(interval);
		}
	}, [autoRefresh]);

	const getStatusIcon = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'healthy':
				return <CheckCircle2 className="w-6 h-6 text-green-600" />;
			case 'degraded':
				return <AlertCircle className="w-6 h-6 text-yellow-600" />;
			case 'unhealthy':
				return <XCircle className="w-6 h-6 text-red-600" />;
			default:
				return <AlertCircle className="w-6 h-6 text-gray-400" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'healthy':
				return 'text-green-600 bg-green-50 border-green-200';
			case 'degraded':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'unhealthy':
				return 'text-red-600 bg-red-50 border-red-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'healthy':
				return 'All Systems Operational';
			case 'degraded':
				return 'Partial Service Degradation';
			case 'unhealthy':
				return 'Service Unavailable';
			default:
				return 'Unknown Status';
		}
	};

	const formatUptime = (seconds?: number) => {
		if (!seconds) return 'N/A';
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${days}d ${hours}h ${minutes}m`;
	};

	return (
		<PublicPageTemplate
			hero={{
				title: "System Status",
				description: "Real-time status of Financbase services and infrastructure",
				size: "sm",
			}}
		>
			{/* Main Status Section */}
			<PublicSection>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-2xl font-bold mb-2">Overall Status</h2>
						{lastUpdated && (
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Last updated: {lastUpdated.toLocaleTimeString()}
							</p>
						)}
					</div>
					<div className="flex items-center gap-4">
						<label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
							<input
								type="checkbox"
								checked={autoRefresh}
								onChange={(e) => setAutoRefresh(e.target.checked)}
								className="rounded"
							/>
							Auto-refresh (1 min)
						</label>
						<Button
							variant="outline"
							size="sm"
							onClick={fetchHealthStatus}
							disabled={isLoading}
						>
							<RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
							Refresh
						</Button>
					</div>
				</div>

				<PublicCard className={cn(
					"border-2",
					healthStatus?.status === 'healthy' && "border-green-200 bg-green-50/50",
					healthStatus?.status === 'degraded' && "border-yellow-200 bg-yellow-50/50",
					healthStatus?.status === 'unhealthy' && "border-red-200 bg-red-50/50"
				)}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{healthStatus && getStatusIcon(healthStatus.status)}
							<div>
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
									{healthStatus ? getStatusLabel(healthStatus.status) : 'Loading...'}
								</h3>
								{healthStatus?.timestamp && (
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{new Date(healthStatus.timestamp).toLocaleString()}
									</p>
								)}
							</div>
						</div>
						{healthStatus?.version && (
							<div className="text-right">
								<p className="text-sm text-gray-600 dark:text-gray-400">API Version</p>
								<p className="text-lg font-semibold text-gray-900 dark:text-white">
									{healthStatus.version}
								</p>
							</div>
						)}
					</div>
				</PublicCard>
			</PublicSection>

			{/* Services Status */}
			{healthStatus?.services && (
				<PublicSection
					title="Service Status"
					description="Detailed status of individual services"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Object.entries(healthStatus.services).map(([serviceName, serviceStatus]) => (
							<PublicCard key={serviceName}>
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center gap-3">
										{serviceName === 'database' && <Database className="w-5 h-5 text-blue-600" />}
										{serviceName === 'api' && <Server className="w-5 h-5 text-blue-600" />}
										{!['database', 'api'].includes(serviceName) && <Globe className="w-5 h-5 text-blue-600" />}
										<h3 className="font-semibold text-gray-900 dark:text-white capitalize">
											{serviceName}
										</h3>
									</div>
									{serviceStatus && getStatusIcon(serviceStatus.status)}
								</div>
								<div className={cn(
									"px-3 py-1 rounded-full text-xs font-medium inline-block mb-2",
									getStatusColor(serviceStatus.status)
								)}>
									{serviceStatus.status}
								</div>
								{serviceStatus.responseTime && (
									<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
										<Clock className="w-4 h-4" />
										<span>{serviceStatus.responseTime}ms</span>
									</div>
								)}
							</PublicCard>
						))}
					</div>
				</PublicSection>
			)}

			{/* System Information */}
			<PublicSection
				title="System Information"
				description="Additional system metrics and information"
				background="muted"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{healthStatus?.uptime && (
						<PublicCard>
							<div className="flex items-center gap-3 mb-2">
								<Clock className="w-5 h-5 text-blue-600" />
								<h3 className="font-semibold text-gray-900 dark:text-white">Uptime</h3>
							</div>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatUptime(healthStatus.uptime)}
							</p>
						</PublicCard>
					)}

					{healthStatus?.timestamp && (
						<PublicCard>
							<div className="flex items-center gap-3 mb-2">
								<Server className="w-5 h-5 text-blue-600" />
								<h3 className="font-semibold text-gray-900 dark:text-white">Last Check</h3>
							</div>
							<p className="text-lg text-gray-900 dark:text-white">
								{new Date(healthStatus.timestamp).toLocaleString()}
							</p>
						</PublicCard>
					)}
				</div>
			</PublicSection>

			{/* Error Information */}
			{healthStatus?.error && (
				<PublicSection title="Error Information">
					<PublicCard className="border-red-200 bg-red-50/50">
						<div className="flex items-start gap-3">
							<XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
							<div>
								<h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
								<p className="text-red-800">{healthStatus.error}</p>
							</div>
						</div>
					</PublicCard>
				</PublicSection>
			)}

			{/* API Endpoint Info */}
			<PublicSection
				title="API Health Check"
				description="Monitor system health programmatically"
			>
				<PublicCard>
					<div className="space-y-4">
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
								Health Check Endpoint
							</h3>
							<code className="block p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono">
								/api/v1/health
							</code>
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
								Response Format
							</h3>
							<pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-x-auto">
								{JSON.stringify({
									status: 'healthy',
									timestamp: '2024-01-01T00:00:00.000Z',
									services: {
										database: { status: 'healthy', responseTime: 45 },
										api: { status: 'healthy', responseTime: 12 },
									},
									uptime: 86400,
									version: 'v1',
								}, null, 2)}
							</pre>
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Use this endpoint to monitor system health in your applications or monitoring tools.
							</p>
						</div>
					</div>
				</PublicCard>
			</PublicSection>
		</PublicPageTemplate>
	);
}

