import { useDrop } from 'react-dnd';
import { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { EventCard } from "./EventCard";
import { useSchedule } from "../hooks/useSchedule";
import { generateTimeSlots, calculateTimeSlot } from "../lib/timeUtils";
import type { Event } from '@db/schema';

export function TimeGrid() {
  const { events, updateEvent } = useSchedule();
  const timeSlots = generateTimeSlots();
  const gridRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, dropRef] = useDrop({
    accept: 'EVENT',
    drop: (item: Event, monitor) => {
      const dropPos = monitor.getClientOffset();
      if (!dropPos || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      console.log('Drop position:', dropPos);
      console.log('Grid rect:', rect);

      const relativeX = dropPos.x - rect.left;
      const dayWidth = rect.width / 3;
      const day = Math.floor(relativeX / dayWidth) + 1;

      const slotHeight = 60; // Regular slot height
      const relativeY = dropPos.y - rect.top;
      const slotIndex = Math.floor(relativeY / slotHeight);

      console.log('Calculated position:', {
        relativeX,
        relativeY,
        day,
        slotIndex,
        totalSlots: timeSlots.length
      });

      if (slotIndex >= 0 && slotIndex < timeSlots.length) {
        const slot = timeSlots[slotIndex];
        if (!slot.isTransition) {
          const [hours, minutes] = slot.time.split(':').map(Number);
          const startTime = new Date();
          startTime.setHours(hours, minutes, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 25);
          
          if (hours >= 10 && hours < 22) {
            console.log('Updating event:', {
              id: item.id,
              day,
              time: slot.time,
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
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // Combine refs
  const combinedRef = (element: HTMLDivElement | null) => {
    gridRef.current = element;
    dropRef(element);
  };

  return (
    <div 
      ref={combinedRef}
      className={`grid grid-cols-3 gap-4 ${isOver ? 'bg-gray-50' : ''}`}
    >
      {[1, 2, 3].map((day) => (
        <div key={day} className="space-y-2">
          <h3 className="text-lg font-semibold text-center">Day {day}</h3>
          <div className="space-y-1">
            {timeSlots.map((slot) => (
              <Card 
                key={`${day}-${slot.time}`}
                className={`p-2 ${
                  slot.isTransition 
                    ? 'min-h-[30px] bg-gray-50 border-dashed border-gray-200' 
                    : 'min-h-[60px] bg-white'
                }`}
              >
                <div className={`flex items-center gap-2 ${
                  slot.isTransition ? 'text-[10px] text-gray-400' : 'text-xs text-gray-500'
                }`}>
                  {slot.isTransition && (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m-12 6h12m-12 6h12M4 7h0m0 6h0m0 6h0" />
                    </svg>
                  )}
                  {slot.label}
                </div>
                {!slot.isTransition && events
                  .filter(e => {
                    if (e.inHoldingArea) return false;
                    if (e.day !== day) return false;
                    const eventTime = new Date(e.startTime);
                    const slotTime = slot.time.split(':').map(Number);
                    return eventTime.getHours() === slotTime[0] && 
                           eventTime.getMinutes() === slotTime[1];
                  })
                  .map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      onUpdate={updateEvent}
                    />
                  ))}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
