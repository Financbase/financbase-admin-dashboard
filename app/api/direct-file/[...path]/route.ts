/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 * 
 * API Proxy Route for IRS Direct File Backend Services
 * 
 * This route proxies requests to the Direct File backend API service.
 * It handles authentication, CORS, and request forwarding.
 * 
 * Routes:
 * - /api/direct-file/* -> http://localhost:8080/*
 * - /api/direct-file/state/* -> http://localhost:8081/*
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const DIRECT_FILE_API_URL = process.env.DIRECT_FILE_API_URL || "http://localhost:8080";
const DIRECT_FILE_STATE_API_URL = process.env.DIRECT_FILE_STATE_API_URL || "http://localhost:8081";

export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	return handleRequest(request, params, "GET");
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	return handleRequest(request, params, "POST");
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	return handleRequest(request, params, "PUT");
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	return handleRequest(request, params, "PATCH");
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	return handleRequest(request, params, "DELETE");
}

async function handleRequest(
	request: NextRequest,
	params: { path: string[] },
	method: string
) {
	try {
		// Verify authentication
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Determine which backend service to use based on path
		const pathSegments = params.path || [];
		const isStateApi = pathSegments[0] === "state";
		
		// Remove "state" prefix if present
		const apiPath = isStateApi ? pathSegments.slice(1).join("/") : pathSegments.join("/");
		const baseUrl = isStateApi ? DIRECT_FILE_STATE_API_URL : DIRECT_FILE_API_URL;
		
		// Construct the target URL
		const targetUrl = `${baseUrl}/${apiPath}${request.nextUrl.search}`;

		// Get request body if present
		let body: BodyInit | undefined;
		if (method !== "GET" && method !== "DELETE") {
			try {
				body = await request.text();
			} catch {
				// No body
			}
		}

		// Forward headers (excluding host and connection)
		const headers = new Headers();
		request.headers.forEach((value, key) => {
			if (
				!["host", "connection", "content-length"].includes(key.toLowerCase())
			) {
				headers.set(key, value);
			}
		});

		// Add authentication header if available
		const authHeader = request.headers.get("authorization");
		if (authHeader) {
			headers.set("Authorization", authHeader);
		}

		// Make request to backend service
		const response = await fetch(targetUrl, {
			method,
			headers,
			body,
		});

		// Get response body
		const responseBody = await response.text();
		let jsonBody;
		try {
			jsonBody = JSON.parse(responseBody);
		} catch {
			jsonBody = responseBody;
		}

		// Return response with CORS headers
		return NextResponse.json(jsonBody, {
			status: response.status,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	} catch (error: any) {
		console.error("Direct File API Proxy Error:", error);
		return NextResponse.json(
			{ error: "Internal server error", message: error.message },
			{ status: 500 }
		);
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

