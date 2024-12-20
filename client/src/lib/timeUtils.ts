import moment from 'moment';

export function generateTimeSlots() {
  const slots: { time: string; isTransition: boolean; showTime?: boolean }[] = [];
  
  // Add morning slots without time labels (8:00 - 9:45)
  for (let hour = 8; hour < 10; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time, isTransition: false, showTime: false, label: '' });
      slots.push({ time: `${hour.toString().padStart(2, '0')}:${(minute + 25).toString().padStart(2, '0')}`, isTransition: true, showTime: false, label: '' });
    }
  }
  
  const startTime = moment().set({ hour: 10, minute: 0 });
  const endTime = moment().set({ hour: 22, minute: 0 });

  while (startTime.isBefore(endTime)) {
    const timeString = startTime.format('HH:mm');
    const minutes = startTime.minutes();
    
    // Mark transition periods at :25 and :55
    const isTransition = minutes === 25 || minutes === 55;
    
    slots.push({
      time: timeString,
      isBreak: isTransition,
      isTransition,
      duration: isTransition ? 5 : 25,
      label: isTransition ? 'Transition Period' : timeString
    });

    startTime.add(isTransition ? 5 : 25, 'minutes');
  }

  return slots;
}

export function calculateTimeSlot(clientY: number, gridTop: number, slotHeight: number) {
  const relativeY = clientY - gridTop;
  const slotIndex = Math.floor(relativeY / slotHeight);
  return slotIndex;
}