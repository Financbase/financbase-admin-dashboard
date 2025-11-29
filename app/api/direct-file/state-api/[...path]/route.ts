/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from '@/lib/logger';

/**
 * API Proxy for Direct File State API
 * 
 * This route proxies requests to the Direct File State API service.
 * Used for state tax filing handoff functionality.
 * 
 * Usage: /api/direct-file/state-api/{state-api-path}
 * Proxies to: {DIRECT_FILE_STATE_API_URL}/{state-api-path}
 */

const DIRECT_FILE_STATE_API_URL = process.env.DIRECT_FILE_STATE_API_URL || "http://localhost:8081";

export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	return proxyRequest(request, params.path, "GET");
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	return proxyRequest(request, params.path, "POST");
}

async function proxyRequest(
	request: NextRequest,
	pathSegments: string[],
	method: string
) {
	try {
		// Verify authentication
		const { auth } = await import("@clerk/nextjs/server");
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const path = pathSegments.join("/");
		const url = new URL(request.url);
		const queryString = url.search;
		
		const backendUrl = `${DIRECT_FILE_STATE_API_URL}/${path}${queryString ? `?${queryString}` : ""}`;
		
		let body: BodyInit | undefined;
		if (method !== "GET" && method !== "DELETE") {
			try {
				body = await request.text();
			} catch {
				// No body
			}
		}
		
		const headers = new Headers();
		request.headers.forEach((value, key) => {
			if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
				headers.set(key, value);
			}
		});
		
		const response = await fetch(backendUrl, {
			method,
			headers,
			body,
		});
		
		const responseBody = await response.text();
		let jsonBody;
		try {
			jsonBody = JSON.parse(responseBody);
		} catch {
			jsonBody = responseBody;
		}
		
		// Get origin from request for CORS validation
		const origin = request.headers.get("origin");
		const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
		const isAllowedOrigin = origin && (
			allowedOrigins.includes(origin) ||
			origin.includes("localhost") ||
			origin.includes("127.0.0.1")
		);

		// Return response with secure CORS headers
		const corsHeaders: Record<string, string> = {
			"Content-Type": response.headers.get("Content-Type") || "application/json",
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Credentials": "true",
		};

		// Only allow specific origins, not wildcard
		if (isAllowedOrigin) {
			corsHeaders["Access-Control-Allow-Origin"] = origin;
		} else if (process.env.NODE_ENV === "development") {
			// In development, allow localhost origins
			corsHeaders["Access-Control-Allow-Origin"] = origin || "http://localhost:3000";
		}

		return NextResponse.json(jsonBody, {
			status: response.status,
			headers: corsHeaders,
		});
	} catch (error) {
		logger.error("Direct File State API proxy error:", error);
		return NextResponse.json(
			{
				error: "Failed to proxy request to Direct File State API",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 502 }
		);
	}
}

