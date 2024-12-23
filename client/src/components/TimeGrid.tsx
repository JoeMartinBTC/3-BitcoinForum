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
    canDrop: () => {
      const [hours, minutes] = slot.time.split(':').map(Number);
      return !slot.isTransition && hours < 20;
    },
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
          ? 'h-[15px] bg-gray-50 border-dashed border-gray-200 cursor-not-allowed' 
          : 'h-[60px] cursor-pointer'
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
      style={{
        backgroundColor: slotEvents[0]?.color || '#ffffff',
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowColorPicker(true);
      }}
    >
      {showColorPicker && (
        <div className="absolute top-0 right-0 z-50 p-2 bg-white rounded shadow-lg">
          <input 
            type="color"
            aria-label="Select event color"
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
      {!slot.isTransition && (
        <div className="flex h-full">
          <div className="flex-1 relative">
            {slotEvents.map(event => (
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
      )}
    </Card>
  );
}

export function TimeGrid() {
  const { events, updateEvent } = useSchedule();
  const timeSlots = generateTimeSlots();
  const [numDays, setNumDays] = useState(3);
  const [hiddenDays, setHiddenDays] = useState<Set<number>>(new Set());
  const [showAllDays, setShowAllDays] = useState(true);

  const toggleDayVisibility = (day: number) => {
    setHiddenDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
    setShowAllDays(false);
  };

  const toggleShowAll = () => {
    setShowAllDays(prev => !prev);
    if (!showAllDays) {
      setHiddenDays(new Set());
    }
  };

  return (
    <div className="w-full min-h-[600px]">
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Number of Days:</label>
            <input 
              type="number" 
              min="1" 
              max="20"
              value={numDays} 
              onChange={(e) => setNumDays(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
          <button
            onClick={toggleShowAll}
            className={`px-3 py-1 rounded ${showAllDays ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
          >
            {showAllDays ? 'Hide Days' : 'Show All'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({length: numDays}, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => toggleDayVisibility(day)}
              className={`px-2 py-1 rounded text-sm ${
                !showAllDays && hiddenDays.has(day) 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-primary/10 text-primary'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>
      <div className="relative w-full overflow-x-auto">
        <div className="flex">
          <div className="sticky left-0 z-10 bg-background">
            <div className="pt-12">
              {timeSlots.map((slot) => (
                <div key={slot.time} className={`${slot.isTransition ? 'h-[15px]' : 'h-[60px]'} flex items-center px-2`}>
                  {!slot.isTransition && slot.showTime !== false && <span className="text-[12px] text-black font-medium">{slot.time}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="grid flex-1 border rounded-lg p-4 w-full" style={{ 
            gridTemplateColumns: `repeat(${Array.from({length: numDays}, (_, i) => i + 1)
              .filter(day => showAllDays || !hiddenDays.has(day))
              .length}, minmax(0, 1fr))`,
            minWidth: 'fit-content',
            gap: '1px',
            background: '#e5e7eb'
          }}>
        
        {Array.from({length: numDays}, (_, i) => i + 1)
          .filter(day => showAllDays || !hiddenDays.has(day))
          .map((day) => (
          <div key={day} className="space-y-2">
            <div className="flex flex-col items-center gap-1 mb-2 px-2">
              <h3 className="text-center text-[14px] font-medium">Day {day}</h3>
            </div>
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
      </div>
    </div>
  );
}