/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: number;
  name: string;
  time: string;
  datetime: string;
}

interface DayEvents {
  day: Date;
  events: CalendarEvent[];
}

interface FullscreenCalendarProps {
  data: DayEvents[];
}

export function FullscreenCalendar({ data }: FullscreenCalendarProps) {
  const eventsByDate = new Map<string, CalendarEvent[]>();
  data.forEach(({ day, events }) => {
    const key = day.toISOString().split('T')[0];
    eventsByDate.set(key, events);
  });

  const getEventsForDate = (date: Date) => {
    const key = date.toISOString().split('T')[0];
    return eventsByDate.get(key) || [];
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            mode="single"
            className="rounded-md border"
            modifiers={{
              hasEvents: (date) => getEventsForDate(date).length > 0,
            }}
            modifiersClassNames={{
              hasEvents: "bg-accent text-accent-foreground",
            }}
          />
          <div className="space-y-2">
            <h3 className="font-semibold">Upcoming Events</h3>
            {data.slice(0, 5).map((dayEvents) =>
              dayEvents.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(dayEvents.day).toLocaleDateString()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
