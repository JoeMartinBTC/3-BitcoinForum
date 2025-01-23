import { useDrop } from 'react-dnd';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const { data: gridData = [], status } = useQuery({
    queryKey: ['timeGrid'],
    queryFn: async () => {
      const res = await fetch('/api/time-grid');
      if (!res.ok) throw new Error('Failed to fetch grid data');
      return res.json();
    }
  });

  const gridItem = gridData.find(item => item.day === day && item.time === slot.time);
  const [backgroundColor, setBackgroundColor] = useState(() => {
    const key = `bg_${day}_${slot.time}`;
    const storedColor = localStorage.getItem(key);
    return gridItem?.backgroundColor || storedColor || '#ffffff';
  });
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
                  fetch('/api/time-grid', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-password': localStorage.getItem('schedule-password') || '' },
                    body: JSON.stringify({ day, time: slot.time, backgroundColor: newColor })
                  })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error('Failed to update background color');
                    }
                    return response.json();
                  })
                  .catch(error => {
                    console.error("Error updating background color:", error);
                    // Handle the error appropriately, e.g., display an error message to the user.
                  });
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
                  fetch('/api/time-grid', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-password': localStorage.getItem('schedule-password') || '' },
                    body: JSON.stringify({ day, time: slot.time, backgroundColor: defaultColor })
                  })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error('Failed to update background color');
                    }
                    return response.json();
                  })
                  .catch(error => {
                    console.error("Error updating background color:", error);
                    // Handle the error appropriately, e.g., display an error message to the user.
                  });
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
  const [numDays, setNumDays] = useState(19); // Limited to 19 days
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
      const allDaysExceptOne = new Set(Array.from({length: numDays}, (_, i) => i + 2));
      setHiddenDays(allDaysExceptOne);
      setShowAllDays(false);
    } else {
      setHiddenDays(new Set());
      setShowAllDays(true);
    }
  };

  const toggleVenue = (days: number[]) => {
    setHiddenDays(prev => {
      const next = new Set(prev);
      const allDaysHidden = days.every(day => next.has(day));

      if (allDaysHidden) {
        days.forEach(day => next.delete(day));
      } else {
        days.forEach(day => next.add(day));
      }

      setShowAllDays(false);
      return next;
    });
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const days = Array.from({length: 6}, (_, i) => i + 1);
                const allHidden = days.every(day => hiddenDays.has(day));
                const otherDays = Array.from({length: 19}, (_, i) => i + 1).filter(d => !days.includes(d));
                setHiddenDays(prev => {
                  const next = new Set(prev);
                  if (allHidden) {
                    days.forEach(day => next.delete(day));
                    otherDays.forEach(day => next.add(day));
                  } else {
                    days.forEach(day => next.add(day));
                  }
                  return next;
                });
                setShowAllDays(false);
              }}
              className={`px-3 py-1 rounded ${Array.from({length: 6}, (_, i) => i + 1).every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            >
              Days 1-6
            </button>
            <button
              onClick={() => {
                const days = Array.from({length: 6}, (_, i) => i + 7);
                const allHidden = days.every(day => hiddenDays.has(day));
                const otherDays = Array.from({length: 19}, (_, i) => i + 1).filter(d => !days.includes(d));
                setHiddenDays(prev => {
                  const next = new Set(prev);
                  if (allHidden) {
                    days.forEach(day => next.delete(day));
                    otherDays.forEach(day => next.add(day));
                  } else {
                    days.forEach(day => next.add(day));
                  }
                  return next;
                });
                setShowAllDays(false);
              }}
              className={`px-3 py-1 rounded ${Array.from({length: 6}, (_, i) => i + 7).every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-red-200 text-red-800 hover:bg-red-300'}`}
            >
              Days 7-12
            </button>
            <button
              onClick={() => {
                const days = Array.from({length: 7}, (_, i) => i + 13);
                const allHidden = days.every(day => hiddenDays.has(day));
                const otherDays = Array.from({length: 19}, (_, i) => i + 1).filter(d => !days.includes(d));
                setHiddenDays(prev => {
                  const next = new Set(prev);
                  if (allHidden) {
                    days.forEach(day => next.delete(day));
                    otherDays.forEach(day => next.add(day));
                  } else {
                    days.forEach(day => next.add(day));
                  }
                  return next;
                });
                setShowAllDays(false);
              }}
              className={`px-3 py-1 rounded ${Array.from({length: 7}, (_, i) => i + 13).every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-red-300 text-red-900 hover:bg-red-400'}`}
            >
              Days 13-19
            </button>
            <button
              onClick={toggleShowAll}
              className="px-3 py-1 rounded bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
            >
              {showAllDays ? 'Hide Days' : 'Show All'}
            </button>
            <button 
              onClick={() => toggleVenue([1,7,13])}
              className={`px-3 py-1 rounded ${[1,7,13].every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Main Stage
            </button>
            <button 
              onClick={() => toggleVenue([2,8,14])}
              className={`px-3 py-1 rounded ${[2,8,14].every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}
            >
              Nebenraum
            </button>
            <button 
              onClick={() => toggleVenue([3,9,15])}
              className={`px-3 py-1 rounded ${[3,9,15].every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-blue-300 text-blue-900 hover:bg-blue-400'}`}
            >
              Donau Tower
            </button>
            <button 
              onClick={() => toggleVenue([4,10,16])}
              className={`px-3 py-1 rounded ${[4,10,16].every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'}`}
            >
              Brigk
            </button>
            <button 
              onClick={() => toggleVenue([5,11,17])}
              className={`px-3 py-1 rounded ${[5,11,17].every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
            >
              Exerzierhalle
            </button>
            <button 
              onClick={() => toggleVenue([6,12,18])}
              className={`px-3 py-1 rounded ${[6,12,18].every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              VIP
            </button>
            <button 
              onClick={() => toggleVenue([19])}
              className={`px-3 py-1 rounded ${[19].every(day => hiddenDays.has(day)) ? 'bg-gray-100 border border-gray-300 text-gray-400' : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'}`}
            >
              Eishalle
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({length: numDays}, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => toggleDayVisibility(day)}
              className={`px-2 py-1 rounded text-sm ${
                !showAllDays && hiddenDays.has(day) 
                  ? 'bg-gray-100 border border-gray-300 text-gray-400' 
                  : [1,7,13].includes(day) ? 'bg-blue-100 text-blue-700' 
                  : [2,8,14].includes(day) ? 'bg-blue-200 text-blue-800'
                  : [3,9,15].includes(day) ? 'bg-blue-300 text-blue-900'
                  : [4,10,16].includes(day) ? 'bg-yellow-50 text-yellow-800'
                  : [5,11,17].includes(day) ? 'bg-yellow-100 text-yellow-800'
                  : day === 19 ? 'bg-yellow-200 text-yellow-800'
                  : [6,12,18].includes(day) ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary'
              }`}
            >
              {[1,7,13].includes(day) ? 'Main Stage' :
             [2,8,14].includes(day) ? 'Nebenraum' :
             [3,9,15].includes(day) ? 'Donau Tower' :
             [4,10,16].includes(day) ? 'Brigk' :
             [5,11,17].includes(day) ? 'Exerzierhalle' :
             day === 19 ? 'Eishalle' :
             [6,12,18].includes(day) ? 'VIP' : `Day ${day}`}
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
            day <= 6 ? 'bg-green-50' : 
            day <= 11 ? 'bg-green-100' : 
            day === 12 ? 'bg-green-100' :
            day <= 18 ? 'bg-green-200' :
            day === 19 ? 'bg-green-300' : 'bg-green-200'
          }`}>
            <div className={`flex flex-col items-center gap-1 mb-2 px-2 ${
              [6, 12, 18].includes(day) ? 'bg-green-100 text-green-700' :
              day <= 6 ? 'bg-blue-100 text-blue-700' :
              day <= 11 ? 'bg-blue-200 text-blue-800' :
              day <= 17 ? 'bg-blue-300 text-blue-900' :
              day === 19 ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-700'
            }`}>
              <div className="flex flex-col items-center text-center text-[11px] font-medium leading-tight py-1">
                <span>{day <= 6 ? 'Do.' : 
                       day <= 12 ? 'Fr.' : 
                       day <= 19 ? 'Sa.' : 
                       day === 20 ? 'Do.' : ''}</span>
                <span>{day <= 6 ? '09.10' : 
                       day <= 12 ? '10.10' : 
                       day <= 19 ? '11.10' : 
                       day === 20 ? '09.10' :
                       day === 19 ? '11.10' : ''}</span>
              </div>
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