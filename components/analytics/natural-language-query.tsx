"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NaturalLanguageQuery() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Natural Language Query</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input placeholder="Ask a question about your data..." />
          <Button>Query</Button>
        </div>
      </CardContent>
    </Card>
  );
}
