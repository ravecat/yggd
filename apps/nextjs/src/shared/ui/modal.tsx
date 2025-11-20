"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export type ModalProps = {
  children: React.ReactNode;
  title?: string;
};

export function Modal({ children, title }: ModalProps) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open: boolean) => !open && router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
