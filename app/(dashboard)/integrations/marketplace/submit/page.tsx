"use client";

import { PluginSubmissionForm } from "@/components/marketplace/plugin-submission-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Info } from "lucide-react";

export default function PluginSubmissionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Plugin</h1>
        <p className="text-gray-600">
          Share your plugin with the Financbase community. All submissions are reviewed by our team before being published.
        </p>
      </div>

      {/* Guidelines */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Submission Guidelines
          </CardTitle>
          <CardDescription>
            Please review these guidelines before submitting your plugin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Plugin Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Plugin must be packaged as a ZIP or TAR file</li>
              <li>Maximum package size: 10MB</li>
              <li>Include a valid manifest.json file</li>
              <li>Entry point file must be clearly specified</li>
              <li>Document all required dependencies</li>
            </ul>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Content Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Provide clear, accurate descriptions</li>
              <li>Include helpful tags for discoverability</li>
              <li>Add screenshots to showcase functionality</li>
              <li>Specify compatibility requirements</li>
              <li>List all required permissions</li>
            </ul>
          </div>
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              Need help developing plugins? Check out our{" "}
              <a 
                href="/docs/developer/plugin-development" 
                className="text-blue-600 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Plugin Development Guide
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <PluginSubmissionForm />
    </div>
  );
}
