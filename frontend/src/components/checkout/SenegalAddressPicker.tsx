'use client';

import { useState } from 'react';
import { THIES_COMMUNES } from '@/lib/senegal-locations';
import { Input } from '@/components/ui/Input';
import { MapPin, Navigation, Compass } from 'lucide-react';

export interface SenegalAddressValue {
  commune: string;
  quarter: string;
  landmark: string;
  phone: string;
  instructions: string;
}

interface SenegalAddressPickerProps {
  value: SenegalAddressValue;
  onChange: (val: SenegalAddressValue) => void;
  disabled?: boolean;
}

export function SenegalAddressPicker({
  value,
  onChange,
  disabled = false,
}: SenegalAddressPickerProps) {
  const communeNames = Object.keys(THIES_COMMUNES);
  const selectedCommuneData = THIES_COMMUNES[value.commune] || THIES_COMMUNES['Mboro'];

  const handleCommuneChange = (commune: string) => {
    const data = THIES_COMMUNES[commune];
    onChange({
      ...value,
      commune,
      quarter: data?.quarters[0] || '',
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
        <MapPin className="w-4 h-4 text-amber-700" />
        <span>Localisation adaptée au Sénégal (sans numéro de rue)</span>
      </div>

      {/* 1. Commune */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Ville / Commune *
          </label>
          <select
            value={value.commune}
            onChange={(e) => handleCommuneChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            {communeNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Quartier */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quartier / Village *
          </label>
          <input
            list="quarters-list"
            value={value.quarter}
            onChange={(e) => onChange({ ...value, quarter: e.target.value })}
            placeholder="Ex: Diamaguène, Cité ICS..."
            disabled={disabled}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
          <datalist id="quarters-list">
            {selectedCommuneData.quarters.map((q) => (
              <option key={q} value={q} />
            ))}
          </datalist>
        </div>
      </div>

      {/* 3. Repère visuel connu */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-gray-500" />
            Repère visuel connu (marché, mosquée, station...) *
          </span>
          <span className="text-[11px] text-gray-500 font-normal">Essentiel pour le livreur</span>
        </label>
        <input
          list="landmarks-list"
          value={value.landmark}
          onChange={(e) => onChange({ ...value, landmark: e.target.value })}
          placeholder="Ex: Près de la Grande Mosquée, face à la station Total..."
          disabled={disabled}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        <datalist id="landmarks-list">
          {selectedCommuneData.popularLandmarks.map((lm) => (
            <option key={lm} value={lm} />
          ))}
        </datalist>
      </div>

      {/* 4. Téléphone + Précisions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Téléphone de contact (destinataire) *
          </label>
          <Input
            type="tel"
            placeholder="Ex: +221 77 123 45 67"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Précisions pour la livraison (facultatif)
          </label>
          <Input
            placeholder="Ex: Maison peinte en bleu, portail noir..."
            value={value.instructions}
            onChange={(e) => onChange({ ...value, instructions: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
