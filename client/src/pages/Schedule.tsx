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
import { EVENT_TEMPLATES, EventTemplate, exportEventTemplates, importEventTemplates } from '../lib/eventTemplates';
import { VersionBadge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Schedule() {
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(true);
  const [password, setPassword] = React.useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        headers: {
          'x-password': password
        }
      });
      if (response.ok) {
        localStorage.setItem('schedule-password', password);
        setShowPasswordDialog(false);
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      alert('Error validating password');
    }
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
        Color: event.color || '',
        Info: event.info || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Schedule");
      XLSX.writeFile(wb, "schedule.xlsx");
    });
  }, [events]);

  return (
    <div className="w-auto mx-4 p-4 relative" ref={targetRef}>
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password (1, 2, or 3)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <VersionBadge />
      <h1 className="text-xl font-bold mb-6">Event Schedule <span className="text-sm ml-2 text-gray-600">v0.8.9.6</span></h1>
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <TimeGrid />
        </Card>
        {localStorage.getItem('schedule-password') !== 'bip25' && (
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Events and Speakers</h2>
            <HoldingArea />
            <div className="flex gap-2 mt-4">
            <button
              onClick={handlePDFExport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Export PDF
            </button>
            {localStorage.getItem('schedule-password') === '99ballons' && (
              <>
                <button
                  onClick={handleExcelExport}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Export Calendar
                </button>
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
                          (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000 + ' minutes' : '',
                        Info: event.info || ''
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
                          (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000 + ' minutes' : '',
                        Info: event.info || ''
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
                <button
                  onClick={async () => {
                    const XLSX = await import('xlsx');
                    // Get all cells with background colors from the DOM
                    const cells = document.querySelectorAll('[data-day][data-time]');
                    const data = Array.from(cells).map((cell: any) => ({
                      Day: cell.dataset.day,
                      Time: cell.dataset.time,
                      Color: (cell as HTMLElement).style.backgroundColor || '#ffffff'
                    }));

                    const ws = XLSX.utils.json_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "BackgroundColors");
                    XLSX.writeFile(wb, "calendar-backgrounds.xlsx");
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  Export Backgrounds
                </button>
              </>
            )}
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
                            color: event.Color || 'bg-blue-100',
                            info: event.Info || ''
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
            <input
              type="file"
              accept=".xlsx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const XLSX = await import('xlsx');
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const password = localStorage.getItem('schedule-password');
                    // Clear existing calendar data first
                    await fetch('/api/events', { 
                      method: 'DELETE',
                      headers: {
                        'x-password': password || ''
                      }
                    });

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
                          headers: { 
                            'Content-Type': 'application/json',
                            'x-password': password || ''
                          },
                          body: JSON.stringify({
                            title: event.Title,
                            description: event.Description,
                            day: event.Day,
                            startTime: event.StartTime,
                            endTime: event.EndTime,
                            isBreak: event.IsBreak === 'Yes',
                            inHoldingArea: event.InHoldingArea === 'Yes',
                            templateId: event.TemplateID,
                            color: event.Color,
                            info: event.Info || ''
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
            {localStorage.getItem('schedule-password') === '99ballons' && (
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
                    <AlertDialogAction onClick={() => {
                      const password = localStorage.getItem('schedule-password');
                      fetch('/api/events', { 
                        method: 'DELETE',
                        headers: {
                          'x-password': password || ''
                        }
                      }).then(() => window.location.reload())
                    }}>
                      Clear Events
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {(localStorage.getItem('schedule-password') === '99ballons' || localStorage.getItem('schedule-password') === '130jahr') && (
              <>
                <button
                  onClick={() => document.getElementById('excelImport')?.click()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Import Calendar
                </button>
                <button
                  onClick={() => document.getElementById('typeImport')?.click()}
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                >
                  Import Type
                </button>
              </>
            )}
            {localStorage.getItem('schedule-password') === '99ballons' && (
              <button
                onClick={async () => {
                  const XLSX = await import('xlsx');
                  // Get all cells with background colors from the DOM
                  const cells = document.querySelectorAll('[data-day][data-time]');
                  const data = Array.from(cells).map((cell: any) => ({
                    Day: cell.dataset.day,
                    Time: cell.dataset.time,
                    Color: (cell as HTMLElement).style.backgroundColor || '#ffffff'
                  }));

                  const ws = XLSX.utils.json_to_sheet(data);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "BackgroundColors");
                  XLSX.writeFile(wb, "calendar-backgrounds.xlsx");
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Export Backgrounds
              </button>
            )}
            {(localStorage.getItem('schedule-password') === '99ballons' || localStorage.getItem('schedule-password') === '130jahr') && (
              <>
                <button
                  onClick={() => document.getElementById('backgroundImport')?.click()}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  Import Backgrounds
                </button>
                <button
                  onClick={() => document.getElementById('typeImport')?.click()}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Import Type
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
                        // Process type import data
                        console.log('Importing types:', jsonData);
                      };
                      reader.readAsBinaryString(file);
                    }
                  }}
                  className="hidden"
                  id="typeImport"
                />
              </>
            )}
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
                    console.log('Importing data:', jsonData);
                    jsonData.forEach((item: any) => {
                      try {
                        const day = item.Day || item.day;
                        const time = item.Time || item.time;
                        if (day && time) {
                          const key = `bg_${day}_${time}`;
                          const color = item.Color || item.backgroundColor || item.color || '#ffffff';
                          localStorage.setItem(key, color);
                          console.log('Setting color:', key, color);

                          // Also apply to currently visible slots
                          const slot = document.querySelector(`[data-day="${day}"][data-time="${time}"]`);
                          if (slot && !slot.querySelector('.event-card')) {
                            (slot as HTMLElement).style.backgroundColor = color;
                          }
                        }
                      } catch (error) {
                        console.error('Error processing item:', item, error);
                      }
                    });
                  };
                  reader.readAsBinaryString(file);
                }
              }}
              className="hidden"
              id="backgroundImport"
            />
          </div>
          </Card>
        )}

        {localStorage.getItem('schedule-password') !== 'bip25' && (
          <Card className="p-4 mt-4 bg-yellow-50">
            <h2 className="text-lg font-semibold mb-2">Wichtige Hinweise:</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>In Event Type wird der Type (Sprecher, etc) definiert. Kann gelöscht werden, aber niemals alle löschen!!</li>
              <li>Event Type kann nicht importiert werden</li>
              <li>Holding Area kann importiert werden, passt aber farblich nur, wenn Event Type korrekt vorhanden ist</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}