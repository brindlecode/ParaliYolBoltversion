import { Search } from 'lucide-react';
import type { Location } from '../types';

interface SearchBoxProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  suggestions: Location[];
}

export default function SearchBox({
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions
}: SearchBoxProps) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}