import { useEffect, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapRef } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import type { Location, Route, TollBooth } from '../types';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicGFyYWxpeW9sIiwiYSI6ImNtNjR3Nzl4YjFndmYya3M1ejZuZ3JpaTkifQ.T0mQkqqI2wcRm7vP05FNAQ';

interface MapComponentProps {
  startLocation: Location | null;
  endLocation: Location | null;
  selectedRoute: Route | null;
  tollBooths: TollBooth[];
  onLocationSelect: (location: Location) => void;
}

export default function MapComponent({
  startLocation,
  endLocation,
  selectedRoute,
  tollBooths,
  onLocationSelect,
}: MapComponentProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    latitude: 39.9334,
    longitude: 32.8597,
    zoom: 6
  });

  useEffect(() => {
    if (startLocation && endLocation && mapRef.current) {
      const bounds = {
        sw: [
          Math.min(startLocation.longitude, endLocation.longitude),
          Math.min(startLocation.latitude, endLocation.latitude)
        ],
        ne: [
          Math.max(startLocation.longitude, endLocation.longitude),
          Math.max(startLocation.latitude, endLocation.latitude)
        ]
      };

      mapRef.current.fitBounds([bounds.sw, bounds.ne], { padding: 100 });
    }
  }, [startLocation, endLocation]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <NavigationControl />
      
      {startLocation && (
        <Marker
          longitude={startLocation.longitude}
          latitude={startLocation.latitude}
          anchor="bottom"
        >
          <MapPin className="text-green-500" size={24} />
        </Marker>
      )}

      {endLocation && (
        <Marker
          longitude={endLocation.longitude}
          latitude={endLocation.latitude}
          anchor="bottom"
        >
          <MapPin className="text-red-500" size={24} />
        </Marker>
      )}

      {tollBooths.map((booth) => (
        <Marker
          key={booth.id}
          longitude={booth.longitude}
          latitude={booth.latitude}
          anchor="bottom"
        >
          <div className="bg-blue-500 p-2 rounded-full">
            <span className="text-white text-xs font-bold">₺{booth.fee}</span>
          </div>
        </Marker>
      ))}

      {selectedRoute?.geometry && (
        <Source
          id="route"
          type="geojson"
          data={{
            type: 'Feature',
            properties: {},
            geometry: selectedRoute.geometry
          }}
        >
          <Layer
            id="route"
            type="line"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 4
            }}
          />
        </Source>
      )}
    </Map>
  );
}