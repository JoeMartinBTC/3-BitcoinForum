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
      const initialClientOffset = monitor.getInitialClientOffset();
      
      if (!dropPos || !initialClientOffset || !gridRef.current) {
        console.error('Drop error: Missing position data or grid reference');
        return;
      }

      const rect = gridRef.current.getBoundingClientRect();
      const gridScrollTop = gridRef.current.scrollTop;
      const windowScrollTop = window.scrollY;
      
      // Calculate day (1-3) based on horizontal position
      const dayWidth = rect.width / 3;
      const relativeX = dropPos.x - rect.left;
      const day = Math.min(Math.max(Math.floor(relativeX / dayWidth) + 1, 1), 3);
      
      // Calculate time slot considering scrolling
      const totalSlotHeight = 90; // 60px for regular slot + 30px for transition
      const relativeY = (dropPos.y + windowScrollTop - rect.top);
      const slotIndex = Math.floor(relativeY / totalSlotHeight);
      
      // Validate slot index
      if (slotIndex < 0 || slotIndex >= timeSlots.length) {
        console.error('Drop error: Invalid slot index:', slotIndex);
        return;
      }

      const slot = timeSlots[slotIndex];
      if (!slot) {
        console.error('Drop error: Invalid slot');
        return;
      }

      // Prevent dropping in transition slots
      if (slot.isTransition) {
        console.warn('Drop rejected: Cannot drop in transition slot');
        return;
      }

      // Parse the time from the slot
      const [hours, minutes] = slot.time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Drop error: Invalid time format:', slot.time);
        return;
      }

      // Create Date objects for start and end times
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Add 25 minutes for end time
      const endTime = new Date(startTime);
      endTime.setMinutes(minutes + 25);

      console.log('Drop validated:', {
        eventId: item.id,
        day,
        slotIndex,
        time: slot.time,
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
      className={`grid grid-cols-3 gap-4 ${isOver ? 'bg-gray-50' : ''}`}
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
                  {slot.isTransition && (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m-12 6h12m-12 6h12M4 7h0m0 6h0m0 6h0" />
                    </svg>
                  )}
                  {slot.label}
                </div>
                {!slot.isTransition && events
                  .filter(e => {
                    if (e.inHoldingArea || e.day !== day) return false;
                    
                    const eventTime = new Date(e.startTime);
                    const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
                    const slotTime = new Date();
                    slotTime.setHours(slotHours, slotMinutes, 0, 0);
                    
                    // Compare hours and minutes
                    return eventTime.getHours() === slotTime.getHours() && 
                           eventTime.getMinutes() === slotTime.getMinutes();
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