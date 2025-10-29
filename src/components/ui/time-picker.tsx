import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string; // formato "HH:mm"
  onChange: (time: string) => void;
  className?: string;
}

export const TimePicker = ({ value, onChange, className }: TimePickerProps) => {
  const [selectedHour, selectedMinute] = value.split(':');

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleHourSelect = (hour: string) => {
    onChange(`${hour}:${selectedMinute || '00'}`);
  };

  const handleMinuteSelect = (minute: string) => {
    onChange(`${selectedHour || '09'}:${minute}`);
  };

  return (
    <div className={cn("flex gap-2 p-2", className)}>
      {/* Horas */}
      <div className="w-16">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 text-center">Hora</p>
        <ScrollArea className="h-[140px]">
          <div className="space-y-0.5 pr-1">
            {hours.map((hour) => (
              <Button
                key={hour}
                type="button"
                variant="ghost"
                onClick={() => handleHourSelect(hour)}
                className={cn(
                  "w-full h-7 justify-center text-xs font-medium transition-all px-0",
                  hour === selectedHour
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {hour}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Separador */}
      <div className="flex items-center justify-center pt-5">
        <span className="text-lg font-bold text-muted-foreground">:</span>
      </div>

      {/* Minutos */}
      <div className="w-16">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 text-center">Min</p>
        <div className="space-y-0.5 pt-1.5">
          {minutes.map((minute) => (
            <Button
              key={minute}
              type="button"
              variant="ghost"
              onClick={() => handleMinuteSelect(minute)}
              className={cn(
                "w-full h-7 justify-center text-xs font-medium transition-all px-0",
                minute === selectedMinute
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {minute}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

