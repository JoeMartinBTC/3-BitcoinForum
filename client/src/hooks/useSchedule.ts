import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@db/schema';

export function useSchedule() {
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => fetch('/api/events').then(res => res.json()),
  });

  const createEventMutation = useMutation({
    mutationFn: (newEvent: Partial<Event>) =>
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      }).then(res => res.json()),
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
