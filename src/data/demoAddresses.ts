export type DemoAddress = {
  id: string
  label: string
  neighborhood: string
  lat: number
  lng: number
}

// Fictional town "Cedar Ridge" placed on real foothill/wildland-urban-interface
// terrain so the map reads as plausible. No real geocoding — a fixed lookup.
export const DEMO_ADDRESSES: DemoAddress[] = [
  {
    id: 'pine-street',
    label: '12 Pine Street',
    neighborhood: 'Cedar Ridge — Lower Village',
    lat: 34.07,
    lng: -118.6919,
  },
  {
    id: 'mountain-road',
    label: '45 Mountain Road',
    neighborhood: 'Cedar Ridge — Ridgeline',
    lat: 34.0755,
    lng: -118.687,
  },
  {
    id: 'central-avenue',
    label: '8 Central Avenue',
    neighborhood: 'Cedar Ridge — Town Center',
    lat: 34.068,
    lng: -118.7,
  },
  {
    id: 'ridgeline-drive',
    label: '220 Ridgeline Drive',
    neighborhood: 'Cedar Ridge — Ridgeline',
    lat: 34.079,
    lng: -118.68,
  },
  {
    id: 'hollow-creek-lane',
    label: '76 Hollow Creek Lane',
    neighborhood: 'Cedar Ridge — Creekside',
    lat: 34.065,
    lng: -118.695,
  },
]

export function findAddress(id: string): DemoAddress | undefined {
  return DEMO_ADDRESSES.find((a) => a.id === id)
}

const STORAGE_KEY = 'resilia.demoAddress'

export function readStoredAddressId(): string | null {
  const id = sessionStorage.getItem(STORAGE_KEY)
  return id && findAddress(id) ? id : null
}

export function storeAddressId(id: string | null) {
  if (id && findAddress(id)) sessionStorage.setItem(STORAGE_KEY, id)
  else sessionStorage.removeItem(STORAGE_KEY)
}
