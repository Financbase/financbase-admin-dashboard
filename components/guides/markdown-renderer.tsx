/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { sanitizeHtml } from '@/lib/utils/sanitize';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

/**
 * Simple markdown to HTML converter
 * Handles basic markdown syntax: headers, bold, italic, links, lists, code blocks
 */
function markdownToHtml(markdown: string): string {
	let html = markdown;

	// Headers
	html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
	html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
	html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

	// Bold
	html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

	// Italic
	html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
	html = html.replace(/_(.*?)_/g, '<em>$1</em>');

	// Code blocks (triple backticks)
	html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

	// Inline code (single backticks)
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

	// Links [text](url)
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

	// Unordered lists
	html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
	html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
	// Wrap consecutive list items in ul tags
	html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
		return '<ul>' + match + '</ul>';
	});

	// Ordered lists
	html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
	// Wrap consecutive numbered list items in ol tags (simplified)
	const olPattern = /(<li>.*<\/li>\n?)+/g;
	// This is a simplified approach - in production, use a proper markdown parser

	// Blockquotes
	html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

	// Horizontal rules
	html = html.replace(/^---$/gim, '<hr>');
	html = html.replace(/^\*\*\*$/gim, '<hr>');

	// Paragraphs (wrap lines that aren't already wrapped)
	html = html.split('\n\n').map(paragraph => {
		const trimmed = paragraph.trim();
		if (!trimmed) return '';
		if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
			// Already HTML, return as is
			return trimmed;
		}
		return '<p>' + trimmed + '</p>';
	}).join('\n\n');

	// Line breaks
	html = html.replace(/\n/g, '<br>');

	return html;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
	if (!content) {
		return null;
	}

	// Convert markdown to HTML
	const html = markdownToHtml(content);
	
	// Sanitize the HTML
	const sanitized = sanitizeHtml(html);

	return (
		<div
			className={cn(
				"prose prose-gray dark:prose-invert max-w-none",
				"prose-headings:font-semibold",
				"prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8",
				"prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6",
				"prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4",
				"prose-p:leading-relaxed prose-p:mb-4",
				"prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4",
				"prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4",
				"prose-li:mb-1",
				"prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
				"prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
				"prose-a:text-primary prose-a:underline prose-a:underline-offset-2",
				"prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4",
				"prose-img:rounded-lg prose-img:my-4",
				"prose-hr:my-8 prose-hr:border-border",
				className
			)}
			dangerouslySetInnerHTML={{ __html: sanitized }}
		/>
	);
}

