"use client";

import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Textarea } from "./textarea";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectTextareaProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
};

export function MultiSelectTextarea({
  value,
  onChange,
  options,
  placeholder = "Select values",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
}: MultiSelectTextareaProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabels = useMemo(() => {
    const selected = new Set(value);
    return options.filter((option) => selected.has(option.value)).map((o) => o.label);
  }, [options, value]);

  const visibleOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(term),
    );
  }, [options, search]);

  const toggleValue = (nextValue: string) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((item) => item !== nextValue));
      return;
    }

    onChange([...value, nextValue]);
  };

  const displayValue = selectedLabels.join(", ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("space-y-2", className)}>
          <Textarea
            readOnly
            disabled={disabled}
            value={displayValue}
            onClick={() => {
              if (!disabled) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className="cursor-pointer min-h-24"
          />
          {selectedLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedLabels.map((label) => (
                <Badge key={label} variant="outline">
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-3">
        <div className="space-y-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {visibleOptions.length ? (
              visibleOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => toggleValue(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                    <HugeiconsIcon
                      icon={isSelected ? Tick02Icon : Cancel01Icon}
                      className={cn(
                        "size-4",
                        isSelected ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                  </Button>
                );
              })
            ) : (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                No options found.
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
