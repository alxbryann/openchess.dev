"use client";

import { useState } from "react";
import { useTournamentStore } from "@/lib/store";
import { PairingSystem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SYSTEMS: { value: PairingSystem; label: string; desc: string; glyph: string }[] = [
  { value: "swiss",       label: "Suizo (Swiss)",  desc: "El más común en torneos abiertos",  glyph: "♘" },
  { value: "roundrobin",  label: "Round Robin",    desc: "Todos contra todos",                glyph: "♛" },
  { value: "elimination", label: "Eliminación",    desc: "Brackets eliminatorios",            glyph: "♜" },
];

export function CreateTournamentDialog({
  triggerLabel = "Nuevo torneo",
  triggerClassName = "",
}: {
  triggerLabel?: string;
  triggerClassName?: string;
} = {}) {
  const router = useRouter();
  const createTournament = useTournamentStore(s => s.createTournament);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    timeControl: "90+30",
    system: "swiss" as PairingSystem,
    totalRounds: 7,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre del torneo es obligatorio");
      return;
    }
    const t = createTournament(form);
    toast.success(`Torneo "${t.name}" creado`);
    setOpen(false);
    router.push(`/tournaments/${t.id}`);
  }

  return (
    <>
      <Button
        className={`gap-2 h-9 text-sm ${triggerClassName}`}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-lg select-none">♔</span>
              <DialogTitle className="font-display text-xl font-semibold">
                Crear torneo
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wider">
                Nombre del torneo <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej. Torneo Municipal de Ajedrez 2025"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-secondary/40 border-border/60 focus:border-primary/50 h-10"
                autoFocus
              />
            </div>

            {/* Location + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Lugar
                </Label>
                <Input
                  id="location"
                  placeholder="Club de Ajedrez"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="bg-secondary/40 border-border/60 focus:border-primary/50 h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="bg-secondary/40 border-border/60 focus:border-primary/50 h-10"
                />
              </div>
            </div>

            {/* Time control + Rounds */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="timeControl" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Control de tiempo
                </Label>
                <Input
                  id="timeControl"
                  placeholder="90+30"
                  value={form.timeControl}
                  onChange={e => setForm(f => ({ ...f, timeControl: e.target.value }))}
                  className="bg-secondary/40 border-border/60 focus:border-primary/50 h-10 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rounds" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Rondas
                </Label>
                <Input
                  id="rounds"
                  type="number"
                  min={1}
                  max={20}
                  value={form.totalRounds}
                  onChange={e => setForm(f => ({ ...f, totalRounds: Number(e.target.value) }))}
                  className="bg-secondary/40 border-border/60 focus:border-primary/50 h-10 font-mono"
                />
              </div>
            </div>

            {/* Pairing system */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Sistema de emparejamiento
              </Label>
              <Select
                value={form.system}
                onValueChange={v => setForm(f => ({ ...f, system: v as PairingSystem }))}
              >
                <SelectTrigger className="bg-secondary/40 border-border/60 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {SYSTEMS.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-primary text-base select-none">{s.glyph}</span>
                        <div>
                          <div className="font-medium text-sm">{s.label}</div>
                          <div className="text-xs text-muted-foreground">{s.desc}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                className="h-9 text-sm text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-9 text-sm gap-2">
                <Plus className="h-3.5 w-3.5" />
                Crear torneo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
