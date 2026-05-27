"use client";

import {
  CITIES_BY_PROVINCE,
  PROVINCES,
} from "@/lib/data/argentina-locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface LocationSelectProps {
  provinceValue: string;
  cityValue: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

export function LocationSelect({
  provinceValue,
  cityValue,
  onProvinceChange,
  onCityChange,
  disabled = false,
}: LocationSelectProps) {
  // provinceValue stores the province name; derive the ID for internal lookups
  const selectedProvince =
    PROVINCES.find((p) => p.name === provinceValue) ??
    PROVINCES.find((p) => p.id === provinceValue); // backward compat with existing records
  const provinceId = selectedProvince?.id ?? "";

  const cities = provinceId
    ? [...(CITIES_BY_PROVINCE[provinceId] ?? [])].sort((a, b) =>
        a.localeCompare(b, "es")
      )
    : [];

  function handleProvinceChange(value: string) {
    // value is the ID from SelectItem; emit the name so forms/DB store the readable label
    const province = PROVINCES.find((p) => p.id === value);
    onProvinceChange(province?.name ?? value);
    onCityChange("");
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 col-span-full">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Provincia
        </label>
        <Select
          value={provinceId}
          onValueChange={handleProvinceChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccioná una provincia" />
          </SelectTrigger>
          <SelectContent>
            {PROVINCES.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Ciudad
        </label>
        <Select
          value={cityValue}
          onValueChange={onCityChange}
          disabled={disabled || !provinceId}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                provinceId
                  ? "Seleccioná una ciudad"
                  : "Primero elegí una provincia"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
