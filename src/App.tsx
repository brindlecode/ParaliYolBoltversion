import { useState } from 'react';
import { Location, Route, VehicleClass } from './types';
import MapComponent from './components/Map';
import SearchBox from './components/SearchBox';
import RouteDetails from './components/RouteDetails';
import VehicleClassSelector from './components/VehicleClassSelector';
import { Navigation } from 'lucide-react';
import { searchLocations, getRoutes } from './services/mapService';

function App() {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [startSuggestions, setStartSuggestions] = useState<Location[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>(VehicleClass.Class1);

  const handleStartSearch = async (value: string) => {
    setStartSearch(value);
    if (value.length > 2) {
      const locations = await searchLocations(value);
      setStartSuggestions(locations);
    } else {
      setStartSuggestions([]);
    }
  };

  const handleEndSearch = async (value: string) => {
    setEndSearch(value);
    if (value.length > 2) {
      const locations = await searchLocations(value);
      setEndSuggestions(locations);
    } else {
      setEndSuggestions([]);
    }
  };

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) {
      setError('Lütfen başlangıç ve varış noktalarını seçin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // vehicleClass parametresini ekledik
      const calculatedRoutes = await getRoutes(startLocation, endLocation, vehicleClass);
      setRoutes(calculatedRoutes);
      if (calculatedRoutes.length > 0) {
        setSelectedRoute(calculatedRoutes[0]);
      }
    } catch (err) {
      setError('Rota hesaplanırken bir hata oluştu');
      console.error('Rota hesaplama hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center">
          <Navigation className="text-green-600 mr-2" size={32} />
          <h1 className="text-2xl font-bold text-gray-800">Türkiye Yol Ücretleri</h1>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 flex gap-4">
        <div className="w-1/3 space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
            <SearchBox
              placeholder="Başlangıç noktası"
              value={startSearch}
              onChange={handleStartSearch}
              onSelect={(location) => {
                setStartLocation(location);
                setStartSearch(location.name);
                setStartSuggestions([]);
              }}
              suggestions={startSuggestions}
            />
            <SearchBox
              placeholder="Varış noktası"
              value={endSearch}
              onChange={handleEndSearch}
              onSelect={(location) => {
                setEndLocation(location);
                setEndSearch(location.name);
                setEndSuggestions([]);
              }}
              suggestions={endSuggestions}
            />
            
            <VehicleClassSelector
              selectedClass={vehicleClass}
              onChange={setVehicleClass}
            />
            
            <button
              onClick={calculateRoute}
              disabled={isLoading || !startLocation || !endLocation}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold 
                hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Hesaplanıyor...' : 'Rotayı Hesapla'}
            </button>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>

          {routes.length > 0 && (
            <RouteDetails
              routes={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
            />
          )}
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <MapComponent
            startLocation={startLocation}
            endLocation={endLocation}
            selectedRoute={selectedRoute}
            tollBooths={selectedRoute?.tollBooths ?? []}
            onLocationSelect={(location) => {
              if (!startLocation) {
                setStartLocation(location);
                setStartSearch(location.name);
              } else if (!endLocation) {
                setEndLocation(location);
                setEndSearch(location.name);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;