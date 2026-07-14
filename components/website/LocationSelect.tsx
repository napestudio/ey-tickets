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
import { inputClass } from "./Contactform";
import { Label } from "../ui/label";

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
      <div className="">
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Provincia
        </Label>
        <Select
          value={provinceId}
          onValueChange={handleProvinceChange}
          disabled={disabled}
        >
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Seleccioná una provincia" />
          </SelectTrigger>
          <SelectContent  className="bg-ey-dark border-2 border-ey-dark text-white">
            {PROVINCES.map((province) => (
              <SelectItem key={province.id} value={province.id} >
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="">
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Ciudad
        </Label>
        <Select
          value={cityValue}
          onValueChange={onCityChange}
          disabled={disabled || !provinceId}
        >
          <SelectTrigger className={inputClass}>
            <SelectValue
              placeholder={
                provinceId
                  ? "Seleccioná una ciudad"
                  : "Primero elegí una provincia"
              }
            />
          </SelectTrigger>
          <SelectContent  className="bg-ey-dark border-2 border-ey-dark text-white">
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
