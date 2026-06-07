"use client";

import { useState } from "react";
import { useTournamentStore } from "@/lib/store";
import { PairingSystem } from "@/lib/types";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SYSTEMS: { value: PairingSystem; label: string; desc: string }[] = [
  { value: "swiss", label: "Suizo", desc: "El más común en torneos abiertos" },
  { value: "roundrobin", label: "Round Robin", desc: "Todos contra todos" },
  { value: "elimination", label: "Eliminación", desc: "Brackets eliminatorios" },
];

export function CreateTournamentDialog({
  triggerLabel = "Nuevo torneo",
  triggerClassName = "",
  triggerSize = "sm" as const,
}: {
  triggerLabel?: string;
  triggerClassName?: string;
  triggerSize?: "sm" | "default" | "lg";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre del torneo es obligatorio");
      return;
    }
    const t = await createTournament(form);
    toast.success(`Torneo "${t.name}" creado`);
    setOpen(false);
    router.push(`/tournaments/${t.id}`);
  }

  return (
    <>
      <Button
        size={triggerSize}
        className={cn("gap-2", triggerClassName)}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 shrink-0" />
        <span className="oc-create-label">{triggerLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <KnightMark size={22} />
              <DialogTitle>Crear torneo</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Nombre del torneo <span className="text-brand">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej. Torneo Municipal de Ajedrez 2025"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="location">Lugar</Label>
                <Input
                  id="location"
                  placeholder="Club de Ajedrez"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="timeControl">Control de tiempo</Label>
                <Input
                  id="timeControl"
                  placeholder="90+30"
                  value={form.timeControl}
                  onChange={e => setForm(f => ({ ...f, timeControl: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rounds">Rondas</Label>
                <Input
                  id="rounds"
                  type="number"
                  min={1}
                  max={20}
                  value={form.totalRounds}
                  onChange={e =>
                    setForm(f => ({ ...f, totalRounds: Number(e.target.value) }))
                  }
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sistema de emparejamiento</Label>
              <div className="grid grid-cols-2 gap-2">
                {SYSTEMS.map(s => {
                  const selected = form.system === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, system: s.value }))}
                      className={cn(
                        "rounded-[var(--radius-md)] border-[1.5px] p-3 text-left transition-all duration-200 ease-out",
                        selected
                          ? "border-brand bg-brand-tint shadow-xs"
                          : "border-line-strong bg-surface hover:border-ink-400 hover:bg-surface-sunk"
                      )}
                    >
                      <div className="text-sm font-semibold text-ink-900">
                        {s.label}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5 leading-snug">
                        {s.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Crear torneo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
