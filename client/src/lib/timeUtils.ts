
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
  
  // Add morning slots with specific labels
  slots.push({ time: '08:30', isTransition: false, showTime: false });
  slots.push({ time: '08:55', isTransition: true, showTime: false });
  slots.push({ time: '09:00', isTransition: false, showTime: true });
  slots.push({ time: '09:25', isTransition: true, showTime: false });
  slots.push({ time: '09:30', isTransition: false, showTime: true });
  slots.push({ time: '09:55', isTransition: true, showTime: false });
  
  const startTime = moment().set({ hour: 10, minute: 0 });
  const endTime = moment().set({ hour: 20, minute: 0 });

  while (startTime.isBefore(endTime) || startTime.isSame(endTime)) {
    const timeString = startTime.format('HH:mm');
    const isTransitionTime = startTime.minutes() === 25 || startTime.minutes() === 55;
    
    // Only add slots up to 20:00
    if (startTime.hours() <= 20) {
      slots.push({ 
        time: timeString, 
        isTransition: isTransitionTime,
        showTime: !isTransitionTime
      });
    }
    
    if (startTime.hours() === 20 && startTime.minutes() === 0) {
      break;
    }
    
    startTime.add(isTransitionTime ? 5 : 25, 'minutes');
  }
  return slots;
}

export function calculateTimeSlot(clientY: number, gridTop: number, slotHeight: number) {
  const relativeY = clientY - gridTop;
  const slotIndex = Math.floor(relativeY / slotHeight);
  return slotIndex;
}
