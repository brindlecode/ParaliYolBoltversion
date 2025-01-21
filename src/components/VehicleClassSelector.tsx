import { VehicleClass, VehicleClassNames, VehicleClassDescriptions } from '../types';
import { Info } from 'lucide-react';

interface VehicleClassSelectorProps {
  selectedClass: VehicleClass;
  onChange: (vehicleClass: VehicleClass) => void;
}

export default function VehicleClassSelector({
  selectedClass,
  onChange
}: VehicleClassSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Araç Sınıfı
      </label>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(VehicleClassNames).map(([value, name]) => (
          <div
            key={value}
            className={`
              relative p-3 border rounded-lg cursor-pointer transition-all
              ${selectedClass === parseInt(value) 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-300'
              }
            `}
            onClick={() => onChange(parseInt(value) as VehicleClass)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{name}</span>
              <div className="group relative">
                <Info size={16} className="text-gray-400" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {VehicleClassDescriptions[parseInt(value) as VehicleClass]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}