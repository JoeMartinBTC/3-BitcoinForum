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
  interface Config {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
  }
  
  const [savedConfigs, setSavedConfigs] = useState<Config[]>([]);

  useEffect(() => {
    const configs = JSON.parse(localStorage.getItem('calendar_configs') || '[]');
    setSavedConfigs(configs);
  }, []);

  const saveConfig = async (config: { name: string; description?: string }) => {
    try {
      const { events, dayTitlesQuery } = useSchedule();
      const configData = {
        ...config,
        events,
        dayTitles: dayTitlesQuery.data,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      const existingConfigs = [...savedConfigs];
      existingConfigs.push(configData);
      localStorage.setItem('calendar_configs', JSON.stringify(existingConfigs));
      setSavedConfigs(existingConfigs);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const loadConfig = (configId: number) => {
    const config = savedConfigs.find(c => c.id === configId);
    if (config) {
      // Apply the loaded configuration
      if (config.events) {
        // Handle events loading
        console.log('Loaded config:', config);
      }
    }
  };

  return (
    <div key="schedule-main-container" className="container mx-auto p-4" ref={targetRef}>
      <h1 className="text-3xl font-bold mb-6">Event Schedule</h1>
      <div key="schedule-container" className="flex flex-col gap-4">
        <Card key="time-grid" className="p-4">
          <TimeGrid />
        </Card>
        <Card key="events-speakers" className="p-4">
          <h2 className="text-xl font-semibold mb-4">Events and Speakers</h2>
          <HoldingArea />
          <div key="action-buttons" className="flex gap-2 mt-4">
            <Dialog key="save-config-dialog">
              <DialogTrigger asChild>
                <button key="save-config-button" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
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

            <Dialog key="load-config-dialog">
              <DialogTrigger asChild>
                <button key="load-config-button" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
                  Load Configuration
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load Calendar Configuration</DialogTitle>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto">
                  {savedConfigs.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No saved configurations</p>
                  ) : (
                    savedConfigs.map((config) => (
                      <div 
                        key={`config-${config.id}`} 
                        className="p-4 border rounded mb-2"
                      >
                        <h3 className="font-bold">{config.name}</h3>
                        {config.description && (
                          <p className="text-sm text-gray-600">{config.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(config.createdAt).toLocaleString()}
                        </p>
                        <Button
                          onClick={() => loadConfig(config.id)}
                          className="mt-2"
                          type="button"
                        >
                          Load
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <button
              key="pdf-export"
              onClick={handlePDFExport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Export PDF
            </button>
            <button
              key="excel-export"
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Export Excel
            </button>
            <AlertDialog key="clear-events-dialog">
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