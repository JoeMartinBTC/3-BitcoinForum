import { useDrop } from 'react-dnd';
import { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { EventCard } from "./EventCard";
import { useSchedule } from "../hooks/useSchedule";
import { generateTimeSlots } from "../lib/timeUtils";
import type { Event } from '@db/schema';

function TimeSlot({ 
  day, 
  slot, 
  events, 
  updateEvent 
}: { 
  day: number;
  slot: ReturnType<typeof generateTimeSlots>[number];
  events: Event[];
  updateEvent: (updates: Partial<Event> & { id: number }) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'EVENT',
    canDrop: () => !slot.isTransition,
    drop: (item: Event) => {
      // Create a new Date object for today
      const today = new Date();
      const [hours, minutes] = slot.time.split(':').map(Number);
      
      // Set the time while maintaining today's date
      const startTime = new Date(today);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time (25 minutes later)
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 25);

      console.log('Dropping event:', {
        id: item.id,
        title: item.title,
        day,
        slot: slot.time,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      updateEvent({
        id: item.id,
        day,
        startTime,
        endTime,
        inHoldingArea: false
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  });

  const slotEvents = events.filter(event => {
    if (event.inHoldingArea || event.day !== day) return false;
    const eventTime = new Date(event.startTime);
    const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
    return (
      eventTime.getHours() === slotHours && 
      eventTime.getMinutes() === slotMinutes
    );
  });

  return (
    <Card 
      ref={drop}
      className={`p-1 transition-all relative ${
        slot.isTransition 
          ? 'h-[30px] bg-gray-50 border-dashed border-gray-200 cursor-not-allowed' 
          : 'h-[60px] bg-white hover:bg-gray-50 cursor-pointer'
      } ${
        isOver && canDrop
          ? 'border-2 border-primary bg-primary/10 ring-2 ring-primary/20'
          : canDrop
          ? 'border border-primary/50 hover:border-primary'
          : ''
      } ${
        !canDrop && isOver
          ? 'border-2 border-destructive/50 bg-destructive/10'
          : ''
      }`}
    >
      <div className="flex h-full">
        <div className={`w-16 shrink-0 flex items-center px-2 ${
          slot.isTransition ? 'text-[10px] text-gray-400' : 'text-xs text-gray-500'
        }`}>
          {slot.isTransition ? (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m-12 6h12m-12 6h12M4 7h0m0 6h0m0 6h0" />
            </svg>
          ) : null}
          {slot.label}
        </div>
        <div className="flex-1 relative">
          {!slot.isTransition && slotEvents.map(event => (
            <div key={event.id} className="-ml-[20%] w-[120%]">
              <EventCard 
                key={event.id} 
                event={event}
                onUpdate={updateEvent}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function TimeGrid() {
  const { events, updateEvent } = useSchedule();
  const timeSlots = generateTimeSlots();

  return (
    <div className="w-full min-h-[600px]">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((day) => (
          <div key={day} className="space-y-2">
            <h3 className="text-lg font-semibold text-center">Day {day}</h3>
            <div className="space-y-1">
              {timeSlots.map((slot) => (
                <TimeSlot
                  key={`${day}-${slot.time}`}
                  day={day}
                  slot={slot}
                  events={events}
                  updateEvent={updateEvent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}