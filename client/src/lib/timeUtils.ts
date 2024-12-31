
import moment from 'moment';

export function generateTimeSlots() {
  interface TimeSlot {
    time: string;
    isTransition: boolean;
    showTime?: boolean;
    isBreak?: boolean;
    duration?: number;
    label?: string;
  }
  const slots: TimeSlot[] = [];
  
  // Add first morning slots
  slots.push({ time: '08:20', isTransition: false, showTime: false });
  slots.push({ time: '08:40', isTransition: false, showTime: true });
  slots.push({ time: '09:00', isTransition: false, showTime: true });
  slots.push({ time: '09:20', isTransition: false, showTime: true });
  slots.push({ time: '09:40', isTransition: false, showTime: true });
  
  const startTime = moment().set({ hour: 10, minute: 0 });
  const endTime = moment().set({ hour: 22, minute: 0 });

  while (startTime.isBefore(endTime)) {
    const timeString = startTime.format('HH:mm');
    
    slots.push({
      time: timeString,
      isBreak: false,
      isTransition: false,
      duration: 20,
      label: timeString
    });

    startTime.add(20, 'minutes');
  }

  return slots;
}

export function calculateTimeSlot(clientY: number, gridTop: number, slotHeight: number) {
  const relativeY = clientY - gridTop;
  const slotIndex = Math.floor(relativeY / slotHeight);
  return slotIndex;
}
