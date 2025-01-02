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
  const bgKey = `bg_${day}_${slot.time}`;
  const [backgroundColor, setBackgroundColor] = useState(() => localStorage.getItem(bgKey) || '#ffffff');
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
      data-slot-info=""
      data-day={day}
      data-time={slot.time}
      className={`p-0 transition-all relative h-[48px] cursor-pointer rounded-none ${
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
        backgroundColor: slotEvents[0]?.color || backgroundColor,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowColorPicker(true);
      }}
    >
      {showColorPicker && (
        <div className="absolute top-0 right-0 z-50 p-2 bg-white rounded shadow-lg">
          <div className="flex flex-col gap-2">
            <input 
              type="color"
              aria-label="Select event color"
              value={slotColor}
              onChange={(e) => {
                const newColor = e.target.value;
                if (slotEvent) {
                  updateEvent({
                    id: slotEvent.id,
                    color: newColor
                  });
                } else {
                  setBackgroundColor(newColor);
                  localStorage.setItem(bgKey, newColor);
                }
                setShowColorPicker(false);
              }}
            />
            <button 
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => {
                const defaultColor = '#ffffff';
                if (slotEvent) {
                  updateEvent({
                    id: slotEvent.id,
                    color: defaultColor
                  });
                } else {
                  setBackgroundColor(defaultColor);
                  localStorage.setItem(bgKey, defaultColor);
                }
                setShowColorPicker(false);
              }}
            >
              Reset
            </button>
          </div>
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
    if (showAllDays) {
      // Hide all days except day 1
      const allDaysExceptOne = new Set(Array.from({length: numDays}, (_, i) => i + 2));
      setHiddenDays(allDaysExceptOne);
      setShowAllDays(false);
    } else {
      // Show all days
      setHiddenDays(new Set());
      setShowAllDays(true);
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
                <div key={slot.time} className="h-[48px] flex items-start px-2">
                  {!slot.isTransition && slot.showTime !== false && <span className="text-[12px] text-black font-medium -translate-y-3">{slot.time}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="grid flex-1 border p-0 w-full bg-gray-200" style={{ 
            gridTemplateColumns: `repeat(${Array.from({length: numDays}, (_, i) => i + 1)
              .filter(day => showAllDays || !hiddenDays.has(day))
              .length}, minmax(0, 1fr))`,
            minWidth: 'fit-content',
            gap: '0'
          }}>
        
        {Array.from({length: numDays}, (_, i) => i + 1)
          .filter(day => showAllDays || !hiddenDays.has(day))
          .map((day) => (
          <div key={day} className={`space-y-0.5 ${
            day <= 5 ? 'bg-gray-50' : 
            day <= 10 ? 'bg-gray-100' : 
            day <= 16 ? 'bg-gray-200' :
            day <= 18 ? 'bg-gray-300' :
            day <= 20 ? 'bg-gray-400' : 'bg-gray-200'
          }`}>
            <div className="flex flex-col items-center gap-1 mb-2 px-2">
              <h3 className="text-center text-[14px] font-medium">
                {day <= 5 ? 'Do. 09.10' : 
                 day <= 10 ? 'Fr. 10.10' : 
                 day <= 16 ? 'Sa. 11.10' : 
                 day <= 18 ? 'VIP 10.10' :
                 day <= 20 ? 'VIP 11.10' : `Day ${day}`}
              </h3>
            </div>
            <div className="space-y-0">
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