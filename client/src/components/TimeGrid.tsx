import { useDrop } from 'react-dnd';
import { useRef, MutableRefObject } from 'react';
import { Card } from "@/components/ui/card";
import { EventCard } from "./EventCard";
import { useSchedule } from "../hooks/useSchedule";
import { generateTimeSlots } from "../lib/timeUtils";
import type { Event } from '@db/schema';

export function TimeGrid() {
  const { events, updateEvent } = useSchedule();
  const timeSlots = generateTimeSlots();
  const gridRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'EVENT',
    drop: (item: Event, monitor) => {
      const dropPos = monitor.getClientOffset();
      if (!dropPos || !gridRef.current) {
        console.error('Drop error: Missing position data or grid reference');
        return;
      }

      const rect = gridRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY;

      // Calculate day (1-3) based on horizontal position
      const dayWidth = rect.width / 3;
      const relativeX = dropPos.x - rect.left;
      const day = Math.min(Math.max(Math.floor(relativeX / dayWidth) + 1, 1), 3);

      // Calculate slot index considering scroll position and grid offset
      const slotHeight = 90; // Height of regular slot (60px) + transition slot (30px)
      const relativeY = (dropPos.y + scrollTop) - rect.top;
      const slotIndex = Math.floor(relativeY / slotHeight);

      console.log('Drop calculation:', {
        dropPos,
        rect,
        scroll: scrollTop,
        relative: {
          x: relativeX,
          y: relativeY
        },
        calculated: {
          day,
          slotIndex
        }
      });

      // Validate slot index
      if (slotIndex < 0 || slotIndex >= timeSlots.length) {
        console.error('Drop error: Invalid slot index:', slotIndex);
        return;
      }

      const targetSlot = timeSlots[slotIndex];
      
      // Prevent dropping in transition slots
      if (targetSlot.isTransition) {
        console.warn('Drop rejected: Cannot drop in transition slot');
        return;
      }

      // Parse the time from the slot
      const [hours, minutes] = targetSlot.time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Drop error: Invalid time format:', targetSlot.time);
        return;
      }

      // Create Date objects for start and end times
      const startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 25);

      console.log('Updating event:', {
        eventId: item.id,
        day,
        slot: targetSlot.time,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      // Update the event with new position
      updateEvent({
        id: item.id,
        day,
        startTime,
        endTime,
        inHoldingArea: false
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // Combine refs safely
  const setRefs = (el: HTMLDivElement | null) => {
    if (el) {
      (gridRef as MutableRefObject<HTMLDivElement | null>).current = el;
      drop(el);
    }
  };

  return (
    <div 
      ref={setRefs}
      className={`grid grid-cols-3 gap-4 relative ${isOver ? 'bg-gray-50' : ''}`}
    >
      {[1, 2, 3].map((day) => (
        <div key={day} className="space-y-2">
          <h3 className="text-lg font-semibold text-center">Day {day}</h3>
          <div className="space-y-1">
            {timeSlots.map((slot, index) => (
              <Card 
                key={`${day}-${slot.time}`}
                className={`p-2 ${
                  slot.isTransition 
                    ? 'min-h-[30px] bg-gray-50 border-dashed border-gray-200' 
                    : 'min-h-[60px] bg-white hover:bg-gray-50 transition-colors'
                }`}
              >
                <div className={`flex items-center gap-2 ${
                  slot.isTransition ? 'text-[10px] text-gray-400' : 'text-xs text-gray-500'
                }`}>
                  {slot.isTransition ? (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m-12 6h12m-12 6h12M4 7h0m0 6h0m0 6h0" />
                    </svg>
                  ) : null}
                  {slot.label}
                </div>
                {!slot.isTransition && events
                  .filter(event => {
                    if (event.inHoldingArea || event.day !== day) return false;
                    const eventTime = new Date(event.startTime);
                    const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
                    return (
                      eventTime.getHours() === slotHours && 
                      eventTime.getMinutes() === slotMinutes
                    );
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
