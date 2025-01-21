import type { Location, Route, TollBooth, VehicleClass } from '../types';
import Papa from 'papaparse';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicGFyYWxpeW9sIiwiYSI6ImNtNjR3Nzl4YjFndmYya3M1ejZuZ3JpaTkifQ.T0mQkqqI2wcRm7vP05FNAQ';

interface TollPoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface TollFee {
  entryPoint: string;
  exitPoint: string;
  vehicleClass: number;
  fee: number;
  highway?: string;
}

let tollPoints: Map<string, TollPoint> = new Map();
let tollFees: TollFee[] = [];

// Konum arama fonksiyonu
export async function searchLocations(query: string): Promise<Location[]> {
  try {
    // Önce gişeler arasında ara
    if (query.length > 2) {
      const matchingTollPoints = Array.from(tollPoints.values())
        .filter(point => 
          point.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(point => ({
          name: point.name,
          latitude: point.latitude,
          longitude: point.longitude
        }));

      if (matchingTollPoints.length > 0) {
        return matchingTollPoints;
      }
    }

    // Gişelerde bulunamazsa Mapbox'ta ara
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?country=tr&language=tr&access_token=${MAPBOX_TOKEN}`
    );
    
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      name: feature.place_name,
      longitude: feature.center[0],
      latitude: feature.center[1]
    }));
  } catch (error) {
    console.error('Konum arama hatası:', error);
    return [];
  }
}

// İki nokta arası mesafe hesaplama (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// En yakın gişeleri bul
function findNearestTollPoints(location: Location, maxDistance: number = 50): TollPoint[] {
  const points: TollPoint[] = [];
  tollPoints.forEach(point => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      point.latitude,
      point.longitude
    );
    if (distance <= maxDistance) {
      points.push(point);
    }
  });
  return points.sort((a, b) => {
    const distA = calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude);
    const distB = calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude);
    return distA - distB;
  });
}

// CSV dosyasından ücret verilerini yükle
async function loadFeesFromCSV(filePath: string, highway: string) {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    const data = Papa.parse(text, { header: true }).data;
    
    data.forEach((row: any) => {
      const entryPoint = row['Giriş Gişesi'] || row['Giriş Noktası'];
      const exitPoint = row['Çıkış Gişesi'] || row['Çıkış Noktası'];
      const vehicleClassStr = row['Araç Sınıfı'];
      const feeStr = row['Ücret'] || row['Geçiş Ücreti'] || row['Ücret (TL)'];

      if (!entryPoint || !exitPoint || !vehicleClassStr || !feeStr) {
        return;
      }

      // Araç sınıfını sayıya çevir
      let vehicleClass = 1;
      const match = vehicleClassStr.match(/\d+/);
      if (match) {
        vehicleClass = parseInt(match[0]);
      }

      // Ücreti sayıya çevir
      const cleanFee = String(feeStr).replace(/[^\d,\.]/g, '').replace(',', '.');
      const fee = parseFloat(cleanFee);

      if (!isNaN(fee) && fee > 0) {
        tollFees.push({
          entryPoint,
          exitPoint,
          vehicleClass,
          fee,
          highway
        });
      }
    });
  } catch (error) {
    console.error(`Hata: ${filePath} yüklenemedi:`, error);
  }
}

// Gişe verilerini yükle
export async function loadTollData() {
  try {
    // Gişe noktaları
    const pointsResponse = await fetch('/data/coordinates/tum_gise_koordinatlar.csv');
    const pointsText = await pointsResponse.text();
    const points = Papa.parse(pointsText, { header: true }).data;
    
    points.forEach((row: any) => {
      if (row['Gişe Noktası'] && row.Enlem && row.Boylam) {
        tollPoints.set(row['Gişe Noktası'], {
          name: row['Gişe Noktası'],
          latitude: parseFloat(row.Enlem),
          longitude: parseFloat(row.Boylam)
        });
      }
    });

    // Tüm ücret CSV dosyalarını yükle
    const feeFiles = [
      {
        path: '/data/csv/1915_canakkale_gecis_ucretleri.csv',
        highway: '1915 Çanakkale Köprüsü'
      },
      {
        path: '/data/csv/anadolu_otoyolu_ucretleri.csv',
        highway: 'Anadolu Otoyolu'
      },
      {
        path: '/data/csv/avrupa_otoyolu_ucretleri.csv',
        highway: 'Avrupa Otoyolu'
      },
      {
        path: '/data/csv/aydin_denizli_otoyolu_gecis_ucretleri.csv',
        highway: 'Aydın-Denizli Otoyolu'
      },
      {
        path: '/data/csv/kuzey_ege_otoyolu_gecis_ucretleri.csv',
        highway: 'Kuzey Ege Otoyolu'
      },
      {
        path: '/data/csv/otoyol_ucretleri_highway20.csv',
        highway: 'Avrupa Otoyolu'
      },
      {
        path: '/data/csv/otoyol_ucretleri_highway31.csv',
        highway: 'Gaziantep-Şanlıurfa Otoyolu'
      },
      {
        path: '/data/csv/otoyol_ucretleri_highway36.csv',
        highway: 'Gaziantep-Şanlıurfa Otoyolu'
      },
      {
        path: '/data/csv/otoyol_ucretleri_highway40.csv',
        highway: 'Adana-Gaziantep Otoyolu'
      },
      {
        path: '/data/csv/otoyol_ucretleri_highway50.csv',
        highway: 'İzmir-Aydın Otoyolu'
      },
      {
        path: '/data/csv/otoyol_ucretleri_highway60.csv',
        highway: 'İzmir-Çeşme Otoyolu'
      },
      {
        path: '/data/csv/otoyolas_Osmangazi_izmir_gecis_ucretleri.csv',
        highway: 'Osmangazi Köprüsü'
      }
    ];

    // Her dosyayı paralel olarak yükle
    await Promise.all(
      feeFiles.map(file => loadFeesFromCSV(file.path, file.highway))
    );

    console.log('Veriler yüklendi:', {
      points: tollPoints.size,
      fees: tollFees.length
    });

  } catch (error) {
    console.error('Veri yükleme hatası:', error);
  }
}

// Rota üzerindeki gişe geçişlerini bul
function findTollBoothsOnRoute(
  start: Location,
  end: Location,
  vehicleClass: VehicleClass
): TollBooth[] {
  const tollBooths: TollBooth[] = [];
  const startPoints = findNearestTollPoints(start);
  const endPoints = findNearestTollPoints(end);

  // Her başlangıç-bitiş gişe kombinasyonu için ücret kontrolü yap
  startPoints.forEach(startPoint => {
    endPoints.forEach(endPoint => {
      const fee = tollFees.find(f => 
        (f.entryPoint === startPoint.name && f.exitPoint === endPoint.name ||
         f.entryPoint === endPoint.name && f.exitPoint === startPoint.name) &&
        f.vehicleClass === vehicleClass
      );

      if (fee) {
        tollBooths.push({
          id: `${startPoint.name}-${endPoint.name}`,
          name: `${startPoint.name} → ${endPoint.name}${fee.highway ? ` (${fee.highway})` : ''}`,
          latitude: startPoint.latitude,
          longitude: startPoint.longitude,
          fee: fee.fee
        });
      }
    });
  });

  return tollBooths;
}

// Rotaları getir
export async function getRoutes(
  start: Location,
  end: Location,
  vehicleClass: VehicleClass
): Promise<Route[]> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?alternatives=true&geometries=geojson&access_token=${MAPBOX_TOKEN}&language=tr`
    );

    const data = await response.json();
    
    return data.routes.map((route: any, index: number) => {
      const distance = route.distance / 1000; // km
      const duration = route.duration / 60;   // dakika
      
      // Rota üzerindeki gişe geçişlerini bul
      const tollBooths = findTollBoothsOnRoute(start, end, vehicleClass);
      const totalFee = tollBooths.reduce((sum, booth) => sum + booth.fee, 0);

      return {
        id: String(index + 1),
        name: index === 0 ? 'En Hızlı Rota' : `Alternatif Rota ${index + 1}`,
        distance: Math.round(distance),
        duration: Math.round(duration),
        tollBooths,
        totalFee,
        geometry: route.geometry
      };
    });

  } catch (error) {
    console.error('Rota hatası:', error);
    return [];
  }
}

// Başlangıçta verileri yükle
loadTollData();