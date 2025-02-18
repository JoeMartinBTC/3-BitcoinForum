import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventType } from "@db/schema";

export function useEventTypes() {
  const queryClient = useQueryClient();

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ["event-types"],
    queryFn: async () => {
      const password = localStorage.getItem("schedule-password");
      const res = await fetch("/api/event-types", {
        headers: {
          "x-password": password || "",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch event types");
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchOnMount: true,
    refetchInterval: 5000,
  });

  const createEventTypeMutation = useMutation({
    mutationFn: (newEventType: EventType) => {
      const payload = {
        ...newEventType,
      };
      const password = localStorage.getItem("schedule-password");
      return fetch("/api/event-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-password": password || "",
        },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => Promise.reject(err));
        }
        return res.json();
      });
    },
    onMutate: async (newEventType) => {
      const previousData = queryClient.getQueryData<EventType[]>(["event-types"]);
      if (previousData) {
        queryClient.setQueryData<EventType[]>(["event-types"], [...previousData, newEventType]);
      }
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["event-types"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
    },
  });

  const deleteEventTypeMutation = useMutation({
    mutationFn: (id: string) => {
      const password = localStorage.getItem("schedule-password");
      return fetch(`/api/event-types/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-password": password || "",
        },
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => Promise.reject(err));
        }
        return res.json();
      });
    },
    onMutate: async (id: string) => {
      const previousEvents = queryClient.getQueryData<EventType[]>(["event-types"]);
      if (previousEvents) {
        queryClient.setQueryData<EventType[]>(["event-types"], 
          previousEvents.filter((e) => e.id !== id)
        );
      }
      return { previousEvents };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
    },
  });

  const updateEventTypeMutation = useMutation({
    mutationFn: (eventType: EventType) => {
      const password = localStorage.getItem("schedule-password");
      return fetch(`/api/event-types/${eventType.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-password": password || "",
        },
        body: JSON.stringify(eventType),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => Promise.reject(err));
        }
        return res.json();
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
    },
  });

  const syncEventTypesMutation = useMutation({
    mutationFn: (eventTypes: EventType[]) => {
      const password = localStorage.getItem("schedule-password");
      return fetch(`/api/event-types/sync`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-password": password || "",
        },
        body: JSON.stringify(eventTypes),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => Promise.reject(err));
        }
        return res.json();
      });
    },
  });

  return {
    eventTypes,
    createEventType: createEventTypeMutation.mutate,
    deleteEventType: deleteEventTypeMutation.mutate,
    syncEventTypes: syncEventTypesMutation.mutate,
    updateEventType: updateEventTypeMutation.mutate,
  };
}