"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EconomicCalendar() {
  const events = [
    { date: "2024-01-15", event: "GDP Release", impact: "High" },
    { date: "2024-01-16", event: "Inflation Data", impact: "Medium" },
    { date: "2024-01-17", event: "Interest Rate Decision", impact: "High" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Economic Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{event.event}</p>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                event.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {event.impact}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
