import { Route } from '../types';
import { Clock, Navigation } from 'lucide-react';

interface RouteDetailsProps {
  routes: Route[];
  selectedRoute: Route | null;
  onRouteSelect: (route: Route) => void;
}

export default function RouteDetails({
  routes,
  selectedRoute,
  onRouteSelect
}: RouteDetailsProps) {
  if (routes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Mevcut Rotalar</h2>
      
      <div className="space-y-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedRoute?.id === route.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onRouteSelect(route)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{route.name}</h3>
              <span className="text-lg font-bold text-green-600">
                {route.totalFee > 0 ? `₺${route.totalFee.toFixed(2)}` : 'Ücretsiz'}
              </span>
            </div>
            
            <div className="flex space-x-4 text-gray-600 text-sm">
              <div className="flex items-center">
                <Navigation size={16} className="mr-1" />
                <span>{route.distance.toFixed(1)} km</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{Math.floor(route.duration / 60)}s {route.duration % 60}d</span>
              </div>
            </div>
            
            {route.tollBooths.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Gişe Geçişleri:</p>
                <div className="space-y-1.5">
                  {route.tollBooths.map((booth, index) => (
                    <div 
                      key={booth.id}
                      className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                    >
                      <span className="text-gray-600">{index + 1}. {booth.name}</span>
                      <span className="font-medium text-green-600">
                        {booth.fee > 0 ? `₺${booth.fee.toFixed(2)}` : 'Ücretsiz'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}