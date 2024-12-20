import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
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
import React, { useCallback, useState } from 'react';
import { usePDF } from 'react-to-pdf';
import { useSchedule } from '../hooks/useSchedule';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


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

  const { events } = useSchedule();

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

  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [savedConfigs, setSavedConfigs] = useState([]); // Assumed state

  const saveConfig = (config) => {
    //Implementation to save config to backend.  Update savedConfigs state accordingly
    fetch('/api/configs', { method: 'POST', body: JSON.stringify(config), headers: { 'Content-Type': 'application/json' } })
      .then(res => res.json())
      .then(data => setSavedConfigs([...savedConfigs, data]));
  };

  const loadConfig = (configId) => {
    //Implementation to load config from backend
    fetch(`/api/configs/${configId}`)
      .then(res => res.json())
      .then(data => { /*Update application state with loaded config data*/ });
  };

  return (
    <div className="container mx-auto p-4" ref={targetRef}>
      <h1 className="text-3xl font-bold mb-6">Event Schedule</h1>
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <TimeGrid />
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Events and Speakers</h2>
          <HoldingArea />
          <div className="flex gap-2 mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                  Save Configuration
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Calendar Configuration</DialogTitle>
                  <DialogDescription>
                    Enter a name and optional description for your calendar configuration
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Configuration Name"
                  onChange={(e) => setConfigName(e.target.value)}
                  className="mb-4"
                />
                <Input
                  placeholder="Description (optional)"
                  onChange={(e) => setConfigDescription(e.target.value)}
                  className="mb-4"
                />
                <Button onClick={() => {
                  if (configName) {
                    saveConfig({ name: configName, description: configDescription });
                    setConfigName('');
                    setConfigDescription('');
                  }
                }}>
                  Save
                </Button>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
                  Load Configuration
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load Calendar Configuration</DialogTitle>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto">
                  {savedConfigs.map((config) => (
                    <div key={config.id} className="p-4 border rounded mb-2">
                      <h3 className="font-bold">{config.name}</h3>
                      {config.description && <p className="text-sm text-gray-600">{config.description}</p>}
                      <p className="text-xs text-gray-500">
                        {new Date(config.createdAt).toLocaleString()}
                      </p>
                      <Button
                        onClick={() => loadConfig(config.id)}
                        className="mt-2"
                      >
                        Load
                      </Button>
                    </div>
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