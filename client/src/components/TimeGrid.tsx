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

  const [{ isOver }, drop] = useDrop({
    accept: 'EVENT',
    drop: (item: Event, monitor) => {
      const dropPos = monitor.getClientOffset();
      const gridElement = gridRef.current;
      
      if (!dropPos || !gridElement) {
        console.log('Drop error: Missing position data or grid reference');
        return;
      }

      // Get grid dimensions
      const rect = gridElement.getBoundingClientRect();
      const dayWidth = rect.width / 3;
      const totalGridHeight = timeSlots.length * 30; // Each slot is 30px (including transitions)
      
      // Calculate day (1-3)
      const relativeX = dropPos.x - rect.left;
      const day = Math.min(Math.max(Math.floor(relativeX / dayWidth) + 1, 1), 3);
      
      // Calculate slot index
      const relativeY = dropPos.y - rect.top;
      const slotIndex = Math.floor((relativeY / totalGridHeight) * timeSlots.length);
      
      console.log('Drop calculations:', {
        relativeX,
        relativeY,
        day,
        slotIndex,
        totalSlots: timeSlots.length
      });

      // Validate slot index
      if (slotIndex < 0 || slotIndex >= timeSlots.length) {
        console.log('Drop error: Invalid slot index:', slotIndex);
        return;
      }

      const targetSlot = timeSlots[slotIndex];
      
      // Prevent dropping in transition slots
      if (targetSlot.isTransition) {
        console.log('Drop rejected: Cannot drop in transition slot');
        return;
      }

      // Create Date objects for start and end times
      const [hours, minutes] = targetSlot.time.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 25);

      console.log('Updating event:', {
        id: item.id,
        day,
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
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div 
      ref={drop}
      className="relative w-full min-h-[600px] border-2 rounded-lg transition-colors duration-200"
      style={{
        borderColor: isOver ? 'rgb(59, 130, 246)' : 'transparent',
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
      }}
    >
      <div
        ref={gridRef}
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
                      ? 'h-[30px] bg-gray-50 border-dashed border-gray-200' 
                      : 'h-[60px] bg-white hover:bg-gray-50 transition-colors'
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
    </div>
  );
}
