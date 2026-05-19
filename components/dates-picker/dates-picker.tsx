"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DateTimeSelection {
  id: number;
  date: string; // formato: "YYYY-MM-DDTHH:MM"
}

interface DateTimePickerProps {
  dateTimeSelections: DateTimeSelection[];
  onAddDateTime: () => void;
  onRemoveDateTime: (id: number) => void;
  onDateChange: (date: string, id: number) => void;
}

export default function DatesPicker({
  dateTimeSelections,
  onAddDateTime,
  onRemoveDateTime,
  onDateChange,
}: DateTimePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      {dateTimeSelections.map((selection, index) => {
        const [datePart, timePart] = selection.date.split("T");
        const currentTime = timePart || "20:00";
        const dateValue = datePart
          ? new Date(datePart + "T00:00:00")
          : undefined;

        const handleDateSelect = (selected: Date | undefined) => {
          if (!selected) return;
          const newDatePart = selected.toISOString().slice(0, 10);
          onDateChange(`${newDatePart}T${currentTime}`, selection.id);
        };

        const handleTimeChange = (time: string) => {
          onDateChange(`${datePart}T${time}`, selection.id);
        };

        return (
          <div key={selection.id} className="flex flex-wrap items-end gap-3">
            {/* Date picker */}
            <div className="flex flex-col gap-1">
              {index === 0 && (
                <span className="text-sm font-medium">Fecha</span>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-40 font-normal",
                      !dateValue && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    {dateValue
                      ? format(dateValue, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={dateValue}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time picker */}
            <div className="flex flex-col gap-1">
              {index === 0 && (
                <span className="text-sm font-medium">
                  Hora (apertura de puertas)
                </span>
              )}
              <Select value={currentTime} onValueChange={handleTimeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-60">
                    {Array.from({ length: 96 }).map((_, i) => {
                      const hour = Math.floor(i / 4)
                        .toString()
                        .padStart(2, "0");
                      const minute = ((i % 4) * 15)
                        .toString()
                        .padStart(2, "0");
                      const value = `${hour}:${minute}`;
                      return (
                        <SelectItem key={i} value={value}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Add / Remove button */}
            <div>
              {index === dateTimeSelections.length - 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddDateTime}
                >
                  +
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveDateTime(selection.id)}
                >
                  -
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
