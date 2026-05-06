export function adaptIGNFeature(feature: any, type: string) {
  return {
    source: type,
    id: String(feature.id ?? feature.properties?.id ?? feature.properties?.id_local),
    geometry: feature.geometry,
    properties: feature.properties
  };
}

export function adaptONFReserve(poi: any) {
  return {
    source: "ONF",
    type: "RBI",
    id: poi.id,
    name: poi.label,
    geometry: {
      type: "Point",
      coordinates: [poi.point.x, poi.point.y]
    },
    properties: {
      href: poi.href,
      img: poi.img
    }
  };
}