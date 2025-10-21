"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Smile, Frown, Meh } from "lucide-react";

export function SentimentRadioGroup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="neutral" className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="positive" id="positive" />
            <Label htmlFor="positive" className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-green-500" />
              Positive
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="neutral" id="neutral" />
            <Label htmlFor="neutral" className="flex items-center gap-2">
              <Meh className="h-4 w-4 text-yellow-500" />
              Neutral
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="negative" id="negative" />
            <Label htmlFor="negative" className="flex items-center gap-2">
              <Frown className="h-4 w-4 text-red-500" />
              Negative
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
