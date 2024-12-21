
import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useSchedule } from "../hooks/useSchedule";
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function CalendarStateManager() {
  const [stateName, setStateName] = useState('');
  const [stateDesc, setStateDesc] = useState('');
  const { events, dayTitlesQuery, saveState, loadState, states = [] } = useSchedule();
  const queryClient = useQueryClient();

  const handleSaveState = async () => {
    if (!stateName) return;
    const currentEvents = queryClient.getQueryData(['events']);
    const currentDayTitles = queryClient.getQueryData(['dayTitles']);
    
    await saveState({
      name: stateName,
      description: stateDesc,
      events: currentEvents,
      dayTitles: currentDayTitles
    });
    
    setStateName('');
    setStateDesc('');
  };

  return (
    <div className="mb-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Manage Calendar States</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Calendar States</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="State name"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={stateDesc}
                onChange={(e) => setStateDesc(e.target.value)}
              />
              <Button onClick={handleSaveState}>Save Current State</Button>
            </div>
            <div className="space-y-2">
              {states?.map((state) => (
                <Card key={state.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{state.name}</h3>
                      <p className="text-sm text-gray-500">{state.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(state.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => loadState(state.id)}
                    >
                      Restore
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
