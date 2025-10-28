"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface AddCourseModalProps {
  children: React.ReactNode;
}

export function AddCourseModal({ children }: AddCourseModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Course</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
          className="space-y-4 mt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" placeholder="e.g. Algebra Basics" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Briefly describe your course..."
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create Manually
            </Button>
            <Button variant="secondary" type="button" className="flex-1">
              Generate with AI
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
