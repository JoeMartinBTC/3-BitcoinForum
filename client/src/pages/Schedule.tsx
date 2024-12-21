
import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarStateManager } from "@/components/CalendarStateManager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useCallback } from 'react';
import { usePDF } from 'react-to-pdf';
import { useSchedule } from '../hooks/useSchedule';

export default function Schedule() {
  const { toPDF, targetRef } = usePDF({
    filename: 'event-schedule.pdf',
    page: {
      format: 'A4',
      orientation: 'landscape',
      margin: 5
    }
  });

  React.useEffect(() => {
    const element = targetRef.current;
    if (element) {
      element.classList.add('pdf-export');
    }
    return () => {
      if (element) {
        element.classList.remove('pdf-export');
      }
    };
  }, [targetRef]);

  const handlePDFExport = useCallback(() => {
    const element = targetRef.current;
    if (element) {
      element.classList.add('pdf-export');
      toPDF();
      setTimeout(() => {
        element.classList.remove('pdf-export');
      }, 100);
    }
  }, [targetRef, toPDF]);

  const { events, states: savedConfigs, dayTitlesQuery } = useSchedule();
  
  const handleExcelExport = useCallback(() => {
    import('xlsx').then(XLSX => {
      const data = events.map(event => ({
        Title: event.title,
        Day: event.day,
        StartTime: new Date(event.startTime).toLocaleTimeString(),
        EndTime: new Date(event.endTime).toLocaleTimeString(),
        Type: event.templateId
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Schedule");
      XLSX.writeFile(wb, "schedule.xlsx");
    });
  }, [events]);

  return (
    <div className="container mx-auto p-4" ref={targetRef}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Schedule</h1>
        <CalendarStateManager />
      </div>
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <TimeGrid />
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Events and Speakers</h2>
          <HoldingArea />
          <div className="flex gap-2 mt-4 flex-wrap">
            <Dialog>
              <DialogTrigger asChild>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Save State
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Calendar State</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  fetch('/api/configs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: formData.get('name'),
                      description: formData.get('description'),
                      events,
                      dayTitles: dayTitlesQuery.data
                    })
                  }).then(() => window.location.reload());
                }}>
                  <div className="grid gap-4 py-4">
                    <Input name="name" placeholder="Configuration Name" required />
                    <Input name="description" placeholder="Description (optional)" />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Configuration</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  Load State
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load Calendar State</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {savedConfigs?.map((config) => (
                    <Card key={config.id} className="p-4">
                      <h3 className="font-bold">{config.name}</h3>
                      <p className="text-sm text-gray-500">{config.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(config.createdAt).toLocaleString()}
                      </p>
                      <Button
                        className="mt-2"
                        onClick={() => {
                          window.location.reload();
                        }}
                      >
                        Load
                      </Button>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <button
              onClick={handlePDFExport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Export Excel
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                  Clear All Events
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Events</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all events from the schedule. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => fetch('/api/events', { method: 'DELETE' }).then(() => window.location.reload())}>
                    Clear Events
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </div>
  );
}
