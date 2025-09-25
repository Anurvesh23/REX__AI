"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
  onImprove: () => void;
  isImproving: boolean;
}

export const DownloadDialog = ({ open, onOpenChange, onDownload, onImprove, isImproving }: DownloadDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Improve with AI before downloading?</AlertDialogTitle>
          <AlertDialogDescription>
            Our AI Assistant can review and rewrite your resume to be more impactful and professional.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={onDownload}>
            Download Anyway
          </Button>
          <AlertDialogAction asChild>
             <Button onClick={onImprove} disabled={isImproving}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isImproving ? "Improving..." : "Improve with AI"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};