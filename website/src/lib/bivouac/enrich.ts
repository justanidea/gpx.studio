import { rulesMap } from "./rules";

type Feature = {
  id: string | number;
  properties?: {
    id?: string | number;
    id_local?: string | number;
    bivouac?: string;
    comment?: string;
    sources?: string[];
  };
};

function getFeatureKey(feature: any): string {
  const raw =
    feature.id_mnhn ?? feature.id ??
    feature.properties?.id ??
    feature.properties?.id_local ??
    feature.properties?.code;

  if (!raw) return "unknown";

  return String(raw).trim();
}

function getRuleKey(feature: any): string {
  const type =
    feature.source ??
    feature.properties?.source ??
    "unknown";

  const id =
    feature.properties?.id_mnhn ?? feature.id ??
    feature.properties?.id ??
    feature.properties?.id_local;

  return `${String(id)}`;
}

export function enrichFeature(feature: any) {
  const key = getRuleKey(feature);

  const rule = rulesMap[key] ?? {
    bivouac: "unknown",
    comment: "No data, please check the source for more information.",
    sources: []
  };

  const p = feature.properties ?? {};

  return {
    ...feature,
    properties: {
      // ===== KEEP ORIGINAL UI CONTRACT =====
      nom: p.nom ?? p.name ?? p.label ?? key,

      bivouac: rule.bivouac,

      reglementation: rule.comment,

      quotas: p.quotas ?? 0,

      reservable: p.reservable ?? false,

      report: p.report ?? rule.comment,

      // optional
      sources: rule.sources ?? []
    }
  };
}