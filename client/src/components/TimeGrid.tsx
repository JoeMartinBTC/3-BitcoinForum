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
        console.log('Missing drop position or grid reference');
        return;
      }

      const rect = gridRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Calculate relative position considering scroll
      const relativeX = dropPos.x - rect.left;
      const relativeY = (dropPos.y + scrollTop) - (rect.top + scrollTop);
      
      // Calculate day (1-3)
      const dayWidth = rect.width / 3;
      const day = Math.floor(relativeX / dayWidth) + 1;
      
      // Calculate time slot
      const slotHeight = 60;
      const slotIndex = Math.floor(relativeY / slotHeight);
      
      console.log('Drop calculations:', {
        relativeX,
        relativeY,
        day,
        slotIndex,
        scrollTop,
        totalSlots: timeSlots.length,
        gridTop: rect.top,
        gridHeight: rect.height
      });

      // Validate slot index
      if (slotIndex < 0 || slotIndex >= timeSlots.length) {
        console.log('Invalid slot index:', slotIndex);
        return;
      }

      const slot = timeSlots[slotIndex];
      if (slot.isTransition) {
        console.log('Cannot drop in transition slot');
        return;
      }

      const [hours, minutes] = slot.time.split(':').map(Number);
      if (hours < 10 || hours >= 22) {
        console.log('Outside valid time range');
        return;
      }

      // Create Date objects in the local timezone
      const today = new Date();
      const startTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes,
        0
      );
      
      const endTime = new Date(startTime.getTime() + 25 * 60000);
      
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
            {timeSlots.map((slot) => (
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
                    if (e.inHoldingArea) return false;
                    if (e.day !== day) return false;
                    const eventTime = new Date(e.startTime);
                    const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
                    return eventTime.getHours() === slotHours && 
                           eventTime.getMinutes() === slotMinutes;
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
