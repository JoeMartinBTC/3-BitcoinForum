import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@db/schema';

export function useSchedule() {
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events');
      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const createEventMutation = useMutation({
    mutationFn: (newEvent: Partial<Event>) => {
      const payload = {
        ...newEvent,
        startTime: newEvent.startTime?.toISOString(),
        endTime: newEvent.endTime?.toISOString(),
      };
      return fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => {
        if (!res.ok) {
          return res.json().then(err => Promise.reject(err));
        }
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Event> & { id: number }) =>
      fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
  };
}
