import { useDrop } from 'react-dnd';
import { useRef, useState } from 'react';
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const slotEvent = events.find(event => {
    const eventTime = new Date(event.startTime);
    const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
    return (
      event.day === day && 
      eventTime.getHours() === slotHours && 
      eventTime.getMinutes() === slotMinutes
    );
  });

  const [slotColor, setSlotColor] = useState(slotEvent?.color || "#ffffff");

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
          ? 'h-[21px] bg-gray-50 border-dashed border-gray-200 cursor-not-allowed' 
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
      className={`${event?.color || ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowColorPicker(true);
      }}
    >
      {showColorPicker && (
        <div className="absolute top-0 right-0 z-50 p-2 bg-white rounded shadow-lg">
          <input 
            type="color" 
            value={slotColor}
            onChange={(e) => {
              const newColor = e.target.value;
              setSlotColor(newColor);
              if (slotEvent) {
                updateEvent({
                  id: slotEvent.id,
                  color: newColor
                });
              }
              setShowColorPicker(false);
            }}
          />
        </div>
      )}
      <div className="flex h-full">
        <div className="flex-1 relative">
          {!slot.isTransition && slotEvents.map(event => (
            <div key={event.id} className="w-full h-full px-1">
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
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-4">
        <div className="pt-12 space-y-1">
          {timeSlots.map((slot) => (
            <div key={slot.time} className={`${slot.isTransition ? 'h-[21px]' : 'h-[60px]'} flex items-center`}>
              {!slot.isTransition && <span className="text-[8px] text-gray-500">{slot.time}</span>}
            </div>
          ))}
        </div>
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