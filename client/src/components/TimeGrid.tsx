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
      
      // Calculate relative position with proper scroll consideration
      const relativeX = dropPos.x - rect.left;
      const relativeY = (dropPos.y - rect.top) + gridScrollTop;
      
      // Calculate day (1-3) with bounds checking
      const dayWidth = rect.width / 3;
      const day = Math.min(Math.max(Math.floor(relativeX / dayWidth) + 1, 1), 3);
      
      // Calculate time slot with transition slots consideration
      const baseSlotHeight = 60; // Regular slot height
      const transitionSlotHeight = 30; // Transition slot height
      let accumulatedHeight = 0;
      let slotIndex = -1;
      
      // Add more detailed logging for debugging
      console.log('Drop position calculation:', {
        dropPos,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        scroll: {
          grid: gridScrollTop,
        },
        relative: {
          x: relativeX,
          y: relativeY
        },
        item: {
          id: item.id,
          title: item.title,
          currentDay: item.day,
          inHoldingArea: item.inHoldingArea
        }
      });
      
      // Validate that we have a valid dragged item
      if (!item || !item.id) {
        console.error('Drop error: Invalid drag item');
        return;
      }
      
      // Find the correct slot index considering variable heights
      for (let i = 0; i < timeSlots.length; i++) {
        const currentSlotHeight = timeSlots[i].isTransition ? transitionSlotHeight : baseSlotHeight;
        if (accumulatedHeight + currentSlotHeight > relativeY) {
          slotIndex = i;
          break;
        }
        accumulatedHeight += currentSlotHeight;
      }

      // Validate slot index and get slot
      if (slotIndex < 0 || slotIndex >= timeSlots.length) {
        console.error('Drop error: Invalid slot index:', slotIndex);
        return;
      }

      const slot = timeSlots[slotIndex];
      
      // Prevent dropping in transition slots
      if (slot.isTransition) {
        console.warn('Drop rejected: Cannot drop in transition slot');
        return;
      }

      // Parse and validate time
      const [hours, minutes] = slot.time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Drop error: Invalid time format:', slot.time);
        return;
      }

      // Validate time range
      if (hours < 10 || hours >= 22) {
        console.error('Drop error: Time out of range:', hours);
        return;
      }

      // Create Date objects for start and end times
      const now = new Date();
      const startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0,
        0
      );
      
      // Add 25 minutes for end time
      const endTime = new Date(startTime.getTime() + 25 * 60000);

      console.log('Drop validated:', {
        eventId: item.id,
        day,
        slotIndex,
        time: slot.time,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      console.log('Updating event:', {
        id: item.id,
        day,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        slot: {
          index: slotIndex,
          time: slot.time,
        }
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
                    if (e.inHoldingArea || e.day !== day) return false;
                    
                    try {
                      // Parse event time
                      const eventTime = new Date(e.startTime);
                      if (isNaN(eventTime.getTime())) {
                        console.error('Invalid event time for event:', e.id);
                        return false;
                      }
                      
                      // Parse slot time
                      const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
                      if (isNaN(slotHours) || isNaN(slotMinutes)) {
                        console.error('Invalid slot time format:', slot.time);
                        return false;
                      }
                      
                      // Create a comparable time for the slot
                      const slotTime = new Date();
                      slotTime.setHours(slotHours, slotMinutes, 0, 0);
                      
                      // Normalize event time for comparison
                      const normalizedEventTime = new Date(eventTime);
                      normalizedEventTime.setSeconds(0, 0);
                      
                      // Compare the times using timestamp comparison
                      const timeMatch = normalizedEventTime.getTime() === slotTime.getTime();
                      
                      if (!timeMatch) {
                        console.debug('Time mismatch for event:', {
                          eventId: e.id,
                          eventTime: normalizedEventTime.toISOString(),
                          slotTime: slotTime.toISOString(),
                        });
                      }
                      
                      return timeMatch;
                    } catch (error) {
                      console.error('Error comparing event and slot times:', error);
                      return false;
                    }
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
