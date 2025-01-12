import { TimeGrid } from "../components/TimeGrid";
import { HoldingArea } from "../components/HoldingArea";
import { Card } from "@/components/ui/card";
import { useRef } from "react";
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
import { EVENT_TEMPLATES, EventTemplate } from '../lib/eventTemplates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VersionBadge } from "@/components/ui/badge";

export default function Schedule() {
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(true);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [level, setLevel] = React.useState('1');

  const handlePasswordSubmit = () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }
    const lowercasePassword = password.toLowerCase();
    if (lowercasePassword === 'bip25') setLevel('1');
    else if (lowercasePassword === '130jahre') setLevel('2');
    else if (lowercasePassword === '99ballons') setLevel('3');
    else {
      setError('Invalid password');
      return;
    }
    localStorage.setItem('schedule-password', level);
    setShowPasswordDialog(false);
  };

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

  const { events, createEvent } = useSchedule();

  const handleExcelExport = useCallback(() => {
    import('xlsx').then(XLSX => {
      const allEvents = events || [];
      const data = allEvents.map(event => ({
        ID: event.id,
        Title: event.title,
        Description: event.description || '',
        Day: event.day,
        StartTime: event.startTime ? new Date(event.startTime).toISOString() : '',
        EndTime: event.endTime ? new Date(event.endTime).toISOString() : '',
        IsBreak: event.isBreak ? 'Yes' : 'No',
        InHoldingArea: event.inHoldingArea ? 'Yes' : 'No',
        TemplateID: event.templateId || '',
        Color: event.color || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Schedule");
      XLSX.writeFile(wb, "schedule.xlsx");
    });
  }, [events]);

  return (
    <>
      {showPasswordDialog && (
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Password</DialogTitle>
            </DialogHeader>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <DialogFooter>
              <Button onClick={handlePasswordSubmit}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div className="w-auto mx-4 p-4 relative" ref={targetRef}>
      <VersionBadge />
      <h1 className="text-xl font-bold mb-6">Event Schedule <span className="text-sm ml-2 text-gray-600">v0.8.3</span></h1>
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <TimeGrid level={level} />
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Events and Speakers</h2>
          <HoldingArea />
          <div className="flex gap-2 mt-4">
            {level !== '1' && (
              <>
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
                  Export Calendar
                </button>
              </>
            )}
            {level === '3' && (
              <>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const XLSX = await import('xlsx');
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        // Clear existing calendar data first
                        await fetch('/api/events', { method: 'DELETE' });

                        const data = e.target?.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);

                        // Process and import the data
                        for (const event of jsonData as any[]) {
                          try {
                            await fetch('/api/events', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: event.Title,
                                description: event.Description,
                                day: event.Day,
                                startTime: event.StartTime,
                                endTime: event.EndTime,
                                isBreak: event.IsBreak === 'Yes',
                                inHoldingArea: event.InHoldingArea === 'Yes',
                                templateId: event.TemplateID,
                                color: event.Color
                              })
                            });
                          } catch (error) {
                            console.error('Failed to import event:', error);
                          }
                        }
                        window.location.reload();
                      };
                      reader.readAsBinaryString(file);
                    }
                  }}
                  className="hidden"
                  id="excelImport"
                />
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const XLSX = await import('xlsx');
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        const data = e.target?.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);

                        // Store the background colors in local storage for persistence
                        const backgroundColors = {};
                        jsonData.forEach((item: any) => {
                          const key = `bg_${item.day}_${item.time}`;
                          const color = item.backgroundColor.startsWith('rgb') 
                            ? item.backgroundColor
                            : `rgb(${item.backgroundColor.split(',').join(', ')})`;
                          localStorage.setItem(key, color);

                          // Also apply to currently visible slots
                          const slot = document.querySelector(`[data-day="${item.day}"][data-time="${item.time}"]`);
                          if (slot && !slot.querySelector('.event-card')) {
                            (slot as HTMLElement).style.backgroundColor = color;
                          }
                        });
                      };
                      reader.readAsBinaryString(file);
                    }
                  }}
                  className="hidden"
                  id="backgroundImport"
                />
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
                <button
                  onClick={() => document.getElementById('excelImport')?.click()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Import Calendar
                </button>
                <button
                  onClick={() => document.getElementById('holdingImport')?.click()}
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                >
                  Import to Holding
                </button>
              </>
            )}
            <button
              onClick={() => {
                import('xlsx').then(XLSX => {
                  console.log('All events:', events);
                  const holdingAreaEvents = events?.filter(event => event.inHoldingArea === true) || [];
                  console.log('Filtered holding area events:', holdingAreaEvents);
                  const filteredEvents = holdingAreaEvents.map(event => ({
                    ID: event.id,
                    Title: event.title,
                    Description: event.description || '',
                    TemplateID: event.templateId || '',
                    Color: event.color || '',
                    Type: EVENT_TEMPLATES.find((t: EventTemplate) => t.id === event.templateId)?.title || '',
                    StartTime: event.startTime ? new Date(event.startTime).toLocaleString() : '',
                    EndTime: event.endTime ? new Date(event.endTime).toLocaleString() : '',
                    Duration: event.endTime && event.startTime ? 
                      (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000 + ' minutes' : ''
                  }));
                  console.log('Holding area events:', filteredEvents);
                  const data = holdingAreaEvents.map(event => ({
                    ID: event.id,
                    Title: event.title,
                    Description: event.description || '',
                    TemplateID: event.templateId || '',
                    Color: event.color || '',
                    Type: EVENT_TEMPLATES.find((t: EventTemplate) => t.id === event.templateId)?.title || '',
                    StartTime: event.startTime ? new Date(event.startTime).toLocaleString() : '',
                    EndTime: event.endTime ? new Date(event.endTime).toLocaleString() : '',
                    Duration: event.endTime && event.startTime ? 
                      (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000 + ' minutes' : ''
                  }));
                  console.log('Excel data:', data);
                  const ws = XLSX.utils.json_to_sheet(data);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "HoldingArea");
                  XLSX.writeFile(wb, "holding-area.xlsx");
                });
              }}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
            >
              Export Holding Area
            </button>
            <input
              type="file"
              accept=".xlsx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const XLSX = await import('xlsx');
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    // Process and import the data
                    for (const event of jsonData as any[]) {
                      try {
                        const startTime = new Date();
                        startTime.setHours(startTime.getHours() + 1);
                        const endTime = new Date(startTime);
                        endTime.setMinutes(endTime.getMinutes() + 25);

                        await fetch('/api/events', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: event.Title,
                            description: event.Description || '',
                            day: 1,
                            startTime: startTime.toISOString(),
                            endTime: endTime.toISOString(),
                            isBreak: false,
                            inHoldingArea: true,
                            templateId: event.TemplateID || '1',
                            color: event.Color || 'bg-blue-100'
                          })
                        });
                      } catch (error) {
                        console.error('Failed to import event:', error);
                      }
                    }
                    window.location.reload();
                  };
                  reader.readAsBinaryString(file);
                }
              }}
              className="hidden"
              id="holdingImport"
            />
            <button
              onClick={() => document.getElementById('backgroundImport')?.click()}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Import Backgrounds
            </button>
          </div>
        </Card>

        <Card className="p-4 mt-4 bg-yellow-50">
          <h2 className="text-lg font-semibold mb-2">Wichtige Hinweise:</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>In Event Type wird der Type (Sprecher, etc) definiert. Kann gelöscht werden, aber niemals alle löschen!!</li>
            <li>Event Type kann nicht importiert werden</li>
            <li>Holding Area kann importiert werden, passt aber farblich nur, wenn Event Type korrekt vorhanden ist</li>
          </ul>
        </Card>
      </div>
    </div>
    </>
  );
}