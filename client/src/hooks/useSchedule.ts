import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@db/schema';

export function useSchedule() {
  const dayTitlesQuery = useQuery({
    queryKey: ['dayTitles'],
    queryFn: () => fetch('/api/day-titles').then(res => res.json()),
  });
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
    onMutate: ({ id, deleted }) => {
      if (deleted) {
        const previousEvents = queryClient.getQueryData(['events']);
        queryClient.setQueryData(['events'], (old: Event[]) => 
          old.filter(e => e.id !== id)
        );
        return { previousEvents };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
    },
    onSettled: () => {
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
    onMutate: ({ id, deleted }) => {
      if (deleted) {
        const previousEvents = queryClient.getQueryData(['events']);
        queryClient.setQueryData(['events'], (old: Event[]) => 
          old.filter(e => e.id !== id)
        );
        return { previousEvents };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const { data: states = [] } = useQuery({
    queryKey: ['calendar-states'],
    queryFn: async () => {
      const res = await fetch('/api/calendar-states');
      if (!res.ok) {
        throw new Error('Failed to fetch calendar states');
      }
      return res.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const saveState = async (state: any) => {
    const response = await fetch('/api/calendar-states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    await queryClient.invalidateQueries({ queryKey: ['calendar-states'] });
    return response.json();
  };

  const loadState = async (stateId: number) => {
    const response = await fetch(`/api/calendar-states/${stateId}`);
    const state = await response.json();
    if (state) {
      await queryClient.setQueryData(['events'], state.events);
      await queryClient.setQueryData(['dayTitles'], state.dayTitles);
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['dayTitles'] });
    }
  };

  return {
    events,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    dayTitlesQuery,
    states,
    saveState,
    loadState,
  };
}
