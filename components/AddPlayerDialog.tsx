"use client";

import { useState } from "react";
import { useTournamentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KnightMark } from "@/components/oc";
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
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Agregar jugador
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <KnightMark size={22} />
              <DialogTitle>Agregar jugador</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pname">
                Nombre completo <span className="text-brand">*</span>
              </Label>
              <Input
                id="pname"
                placeholder="Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rating">
                Rating FIDE
                <span className="text-ink-400 ml-1 font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id="rating"
                type="number"
                placeholder="1500"
                min={100}
                max={3500}
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="font-mono"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cerrar
              </Button>
              <Button type="submit" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Agregar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
