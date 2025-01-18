import React, { useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/lib/utils';
import EventCard from './EventCard';
import { useSchedule } from '@/hooks/useSchedule';
import { ChromePicker } from 'react-color';

interface TimeSlotProps {
  time: string;
  day: number;
  events: any[];
  numDays: number;
  hiddenDays: number[];
  onEventMove: (event: any, day: number, time: string) => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ time, day, events, onEventMove }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.EVENT,
    drop: (item: any) => onEventMove(item.event, day, time),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const bgKey = `bg_${day}_${time}`;
    const savedColor = localStorage.getItem(bgKey);
    if (savedColor) {
      setBackgroundColor(savedColor);
    }
  }, [day, time]);

  const matchingEvents = events.filter(
    event => event.day === day && event.startTime === time && !event.inHoldingArea
  );

  return (
    <div
      ref={drop}
      className={`time-slot relative ${isOver ? 'bg-gray-100' : ''}`}
      style={{ backgroundColor }}
      data-day={day}
      data-time={time}
      onDoubleClick={(e) => {
        if (!e.target.closest('.event-card')) {
          setShowColorPicker(true);
        }
      }}
    >
      {showColorPicker && (
        <div className="absolute z-50">
          <div
            className="fixed inset-0"
            onClick={() => setShowColorPicker(false)}
          />
          <ChromePicker
            color={backgroundColor}
            onChange={(color) => {
              const bgKey = `bg_${day}_${time}`;
              localStorage.setItem(bgKey, color.hex);
              setBackgroundColor(color.hex);
            }}
          />
        </div>
      )}
      {matchingEvents.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

const TimeGrid: React.FC<{ numDays: number; hiddenDays: number[] }> = ({
  numDays,
  hiddenDays,
}) => {
  const { events, moveEvent } = useSchedule();

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00"
  ];

  const handleEventMove = useCallback((event: any, newDay: number, newTime: string) => {
    moveEvent(event.id, newDay, newTime);
  }, [moveEvent]);

  const visibleDays = Array.from({ length: numDays }, (_, i) => i + 1)
    .filter(day => !hiddenDays.includes(day));

  return (
    <div className="time-grid">
      <div className="time-labels">
        {timeSlots.map(time => (
          <div key={time} className="time-label">
            {time}
          </div>
        ))}
      </div>
      {visibleDays.map(day => (
        <div key={day} className="day-column">
          {timeSlots.map(time => (
            <TimeSlot
              key={`${day}-${time}`}
              time={time}
              day={day}
              events={events}
              numDays={numDays}
              hiddenDays={hiddenDays}
              onEventMove={handleEventMove}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TimeGrid;