// Client-side "saved cars" / favourites store, backed by localStorage so it
// works for logged-out visitors. Stores a small summary per car so the
// Favourites drawer can render without an API round-trip. Both the car detail
// page (Save button) and the navbar Favourites drawer read/write through here,
// and a window event keeps every open surface in sync.

export interface SavedCar {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
}

const KEY = "iac_saved_cars";
export const SAVED_CARS_EVENT = "iac-saved-cars-changed";

export function getSavedCars(): SavedCar[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    // Keep only well-formed entries (tolerates an earlier id-only format).
    return raw.filter(
      (c): c is SavedCar => !!c && typeof c === "object" && typeof c.id === "string",
    );
  } catch {
    return [];
  }
}

function write(cars: SavedCar[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cars));
    window.dispatchEvent(new Event(SAVED_CARS_EVENT));
  } catch {
    /* localStorage unavailable (private mode / quota) — ignore */
  }
}

export function isSaved(id: string): boolean {
  return getSavedCars().some(c => c.id === id);
}

/** Add if absent, remove if present. Returns the new saved state. */
export function toggleSavedCar(car: SavedCar): boolean {
  const cars = getSavedCars();
  const exists = cars.some(c => c.id === car.id);
  write(exists ? cars.filter(c => c.id !== car.id) : [car, ...cars]);
  return !exists;
}

export function removeSavedCar(id: string): void {
  write(getSavedCars().filter(c => c.id !== id));
}
