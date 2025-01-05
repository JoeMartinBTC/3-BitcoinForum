
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
import { VersionBadge } from "@/components/ui/badge";
import { useState } from 'react';
import { Login } from '../components/Login';
import { UserRole, canEditEvents, canImportData } from '@/lib/auth';

export default function Schedule() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { events, createEvent } = useSchedule();
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

  if (!userRole) {
    return <Login onLogin={(role: UserRole) => setUserRole(role)} />;
  }

  return (
    <div className="w-auto mx-4 p-4 relative" ref={targetRef}>
      {/* Rest of your JSX remains the same */}
    </div>
  );
}
