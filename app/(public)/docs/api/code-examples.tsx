"use client";

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

const codeExamples = {
	javascript: {
		language: "JavaScript",
		code: `// Get accounts
const response = await fetch('https://api.financbase.com/api/accounts', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const { accounts } = await response.json();
console.log(accounts);`
	},
	python: {
		language: "Python",
		code: `import requests

# Get transactions
response = requests.get(
    'https://api.financbase.com/api/transactions',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

data = response.json()
print(data)`
	},
	curl: {
		language: "cURL",
		code: `curl -X GET https://api.financbase.com/api/analytics \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -G -d "period=30d"`
	},
	php: {
		language: "PHP",
		code: `<?php

$ch = curl_init('https://api.financbase.com/api/accounts');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);`
	}
};

export function CodeExamples() {
	const [copied, setCopied] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("javascript");

	const copyToClipboard = async (code: string, language: string) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(language);
			setTimeout(() => setCopied(null), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<Card className="border-2 shadow-lg">
			<CardHeader>
				<CardTitle className="text-2xl">Try It Out</CardTitle>
				<p className="text-muted-foreground mt-2">
					Select your preferred language and copy the code example
				</p>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-4 mb-6">
						<TabsTrigger value="javascript">JavaScript</TabsTrigger>
						<TabsTrigger value="python">Python</TabsTrigger>
						<TabsTrigger value="curl">cURL</TabsTrigger>
						<TabsTrigger value="php">PHP</TabsTrigger>
					</TabsList>
					
					{Object.entries(codeExamples).map(([key, example]) => (
						<TabsContent key={key} value={key} className="mt-0">
							<div className="relative group">
								<div className="absolute top-4 right-4 z-10">
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
										onClick={() => copyToClipboard(example.code, key)}
									>
										{copied === key ? (
											<Check className="h-4 w-4 text-green-600" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
								<pre className="bg-slate-950 dark:bg-slate-900 text-slate-100 p-6 rounded-lg text-sm overflow-x-auto border border-slate-800">
									<code className="font-mono">{example.code}</code>
								</pre>
							</div>
						</TabsContent>
					))}
				</Tabs>
			</CardContent>
		</Card>
	);
}

