"use client";

import { useState } from "react";
import { useTournamentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function AddPlayerDialog({ tournamentId }: { tournamentId: string }) {
  const addPlayer = useTournamentStore(s => s.addPlayer);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    addPlayer(tournamentId, {
      name: name.trim(),
      rating: rating ? parseInt(rating) : 1500,
    });
    toast.success(`${name.trim()} agregado`);
    setName("");
    setRating("");
  }

  function handleClose() {
    setOpen(false);
    setName("");
    setRating("");
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 h-8 text-xs"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Agregar jugador
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm border-border bg-card">
          <DialogHeader className="pb-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-lg select-none">♟</span>
              <DialogTitle className="font-display text-xl font-semibold">
                Agregar jugador
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pname" className="text-xs text-muted-foreground uppercase tracking-wider">
                Nombre completo <span className="text-primary">*</span>
              </Label>
              <Input
                id="pname"
                placeholder="Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-secondary/40 border-border/60 focus:border-primary/50 h-10"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rating" className="text-xs text-muted-foreground uppercase tracking-wider">
                Rating FIDE
                <span className="text-muted-foreground/50 ml-1 normal-case tracking-normal">(opcional)</span>
              </Label>
              <Input
                id="rating"
                type="number"
                placeholder="1500"
                min={100}
                max={3500}
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="bg-secondary/40 border-border/60 focus:border-primary/50 h-10 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                className="h-9 text-sm text-muted-foreground"
                onClick={handleClose}
              >
                Cerrar
              </Button>
              <Button type="submit" className="h-9 text-sm gap-2">
                <UserPlus className="h-3.5 w-3.5" />
                Agregar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
