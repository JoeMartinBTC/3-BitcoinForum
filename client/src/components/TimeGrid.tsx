import { useDrop } from 'react-dnd';
import { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { EventCard } from "./EventCard";
import { useSchedule } from "../hooks/useSchedule";
import { generateTimeSlots } from "../lib/timeUtils";
import type { Event } from '@db/schema';

export function TimeGrid() {
  const { events, updateEvent } = useSchedule();
  const timeSlots = generateTimeSlots();

  const gridRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'EVENT',
    drop: (item: { id: number } & Event, monitor) => {
      const dropPos = monitor.getClientOffset();
      if (!dropPos || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const relativeX = dropPos.x - rect.left;
      const relativeY = dropPos.y - rect.top;
      
      const dayWidth = rect.width / 3;
      const day = Math.floor(relativeX / dayWidth) + 1;
      
      // Calculate slot index first
      const slotIndex = Math.floor(relativeY / 60); // Default to regular slot height
      const slot = timeSlots[slotIndex];
      
      if (slot && !slot.isTransition) {
        const [hours, minutes] = slot.time.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 25);
        
        updateEvent({
          id: item.id,
          day,
          startTime,
          endTime,
          inHoldingArea: false
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const setRefs = (el: HTMLDivElement | null) => {
    if (el) {
      gridRef.current = el;
      drop(el);
    }
  };

  return (
    <div 
      ref={setRefs}
      className="grid grid-cols-3 gap-4"
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
                  .filter(e => e.day === day && !e.inHoldingArea)
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
