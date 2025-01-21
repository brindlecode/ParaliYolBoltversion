export interface TollBooth {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  fee: number;
}

export interface Route {
  id: string;
  name: string;
  distance: number; // kilometre
  duration: number; // dakika
  tollBooths: TollBooth[];
  totalFee: number;
  geometry?: {
    coordinates: [number, number][];
    type: string;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export enum VehicleClass {
  Class1 = 1, // Otomobil
  Class2 = 2, // 2 Akslı Küçük Otobüs
  Class3 = 3, // 3 Akslı Otobüs
  Class4 = 4, // 4-5 Akslı Kamyon ve Tır
  Class5 = 5, // 6+ Akslı Kamyon ve Tır
  Class6 = 6  // Motosiklet
}

export const VehicleClassNames = {
  [VehicleClass.Class1]: "1. Sınıf (Otomobil)",
  [VehicleClass.Class2]: "2. Sınıf (2 Akslı Küçük Otobüs)",
  [VehicleClass.Class3]: "3. Sınıf (3 Akslı Otobüs)",
  [VehicleClass.Class4]: "4. Sınıf (4-5 Akslı Kamyon ve Tır)",
  [VehicleClass.Class5]: "5. Sınıf (6+ Akslı Kamyon ve Tır)",
  [VehicleClass.Class6]: "6. Sınıf (Motosiklet)"
};

export const VehicleClassDescriptions = {
  [VehicleClass.Class1]: "Otomobil, Minibüs (13 koltuk ve altı), Kamyonet (3.5 ton ve altı)",
  [VehicleClass.Class2]: "2 Akslı Otobüs, Kamyon (3.5 ton üzeri)",
  [VehicleClass.Class3]: "3 Akslı Otobüs, Kamyon",
  [VehicleClass.Class4]: "4 veya 5 Akslı Kamyon ve Tır",
  [VehicleClass.Class5]: "6 ve üzeri Akslı Kamyon ve Tır",
  [VehicleClass.Class6]: "Motosiklet"
};