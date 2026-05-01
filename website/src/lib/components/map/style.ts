import { settings } from '$lib/logic/settings';
import { get, type Writable } from 'svelte/store';
import {
    basemaps,
    defaultBasemap,
    maptilerKeyPlaceHolder,
    overlays,
    terrainSources,
} from '$lib/assets/layers';
import { getLayers } from '$lib/components/map/layer-control/utils';
import { i18n } from '$lib/i18n.svelte';
import { selectedRefuge, refugeLoading } from '$lib/logic/refuge';
import { selectedBivouac } from '$lib/logic/bivouac';
import { selectedFeature } from '$lib/logic/selectedFeature';
import { fileStateCollection } from '$lib/logic/file-state';
import { selection } from '$lib/logic/selection';
import { loadFile } from '$lib/logic/file-actions';
import { loadFiles } from '$lib/logic/file-actions';
const { currentBasemap, fileOrder, currentOverlays, customLayers, opacities, terrainSource } = settings;

const emptySource: maplibregl.GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
        type: 'FeatureCollection',
        features: [],
    },
};
export const ANCHOR_LAYER_KEY = {
    overlays: 'overlays-end',
    mapillary: 'mapillary-end',
    tracks: 'tracks-end',
    directionMarkers: 'direction-markers-end',
    distanceMarkers: 'distance-markers-end',
    startEndMarkers: 'start-end-markers-end',
    interactions: 'interactions-end',
    overpass: 'overpass-end',
    waypoints: 'waypoints-end',
    routingControls: 'routing-controls-end',
};
const anchorLayers: maplibregl.LayerSpecification[] = Object.values(ANCHOR_LAYER_KEY).map((id) => ({
    id: id,
    type: 'symbol',
    source: 'empty-source',
}));

export class StyleManager {
    private _map: Writable<maplibregl.Map | null>;
    private _maptilerKey: string;
    private _pastOverlays: Set<string> = new Set();
    private _loadedIcons = new Set<string>();
    private _loadingIcons = new Set<string>();
    private _basemapLabelLayerIds: string[] = [];
    private _labelsHidden = false;
    private _summitsLoading = false;
    private _summitsPending = false;
    private _bivouacLoading = false;
    private _bivouacPending = false;
    private _isStartup = true;
    private _protectedLayers = new Set([
        'refuges-poi'
    ]);
    private _loadedBBox: {
        west: number;
        south: number;
        east: number;
        north: number;
    } | null = null;
    constructor(map: Writable<maplibregl.Map | null>, maptilerKey: string) {
        this._map = map;
        this._maptilerKey = maptilerKey;

        // --- MAP INIT SUB ---
        this._map.subscribe((map_) => {
            if (!map_) return;

            this.updateBasemap();

            map_.on('load', () => {
                this.updateBivouac(map_);
            });

            // UX : curseur pointer
            map_.on('mouseenter', 'traces-line', () => {
                map_.getCanvas().style.cursor = 'pointer';
            });

            map_.on('mouseleave', 'traces-line', () => {
                map_.getCanvas().style.cursor = '';
            });

            map_.on('style.load', async () => {
                this.cacheBasemapLabels(map_);
                this.addTracesLayer(map_);

                if (this._isStartup) {
                    this.hideBasemapLabels(map_);
                    this._isStartup = false;
                }

                this.updateOverlays();
                this.updateTerrain();

                await this.updateRefuges(map_);

                this.updateBivouac(map_);
                const res = await fetch('/api/traces');
                const traces = await res.json();
                const lengths = traces.map(t => t.distance);

                const min = Math.min(...lengths);
                const max = Math.max(...lengths);
                console.log(
                    map_.getStyle().layers.map(l => l.id)
                );
                const geojson = {
                    type: 'FeatureCollection',
                    features: traces.map((t: any) => ({
                        type: 'Feature',
                        properties: {
                            name: t.name,
                            distance: t.distance,
                            lengthNorm: this.normalize(t.distance, min, max)
                        },
                        geometry: {
                            type: 'LineString',
                            coordinates: t.coordinates
                        }
                    }))
                };

                const source = map_.getSource('traces') as maplibregl.GeoJSONSource;
                source.setData(geojson);

            });
                map_.on('idle', () => {
                if (map_.getLayer('refuges-poi')) {
                    map_.moveLayer('refuges-poi', 'tracks-end');
                }
                if (map_.getLayer('summits-poi')) {
                    console.log("got summits layer")
                    map_.moveLayer('summits-poi', 'tracks-end');
                };

            });

            map_.on('click', async (e) => {
                const features = map_.queryRenderedFeatures(e.point);
                const refuge = features.find(f => f.layer.id === 'refuges-poi');
                const bivouac = features.find(f => f.layer.id === 'bivouac-areas');
                const traces = features.find(f => f.layer.id === 'traces-line');

                if (traces) {
                    console.log(traces);
                    const name = traces.properties?.name;
                    if (!name) return;

                    await this.openTraceInEditor(name);
                    return
                }

                if (refuge) {
                    await this.handleRefugeClick(refuge);
                    return;
                }

                if (bivouac) {
                    this.handleBivouacClick(bivouac);
                    return;
                }
            });

            map_.on('pitch', () => this.updateTerrain());

            map_.on('moveend', async () => {
                this.updateRefuges(map_);
                this.updateSummits(map_);
            });
        });

        // --- GLOBAL STORE REACTIONS ---
        currentBasemap.subscribe(() => this.updateBasemap());

        customLayers.subscribe(() => this.updateBasemap());

        opacities.subscribe(() => this.updateOverlays());

        terrainSource.subscribe(() => this.updateTerrain());

        // IMPORTANT: overlays central reaction (snowMask incluse)
        currentOverlays.subscribe((value) => {
            const map_ = get(this._map);
            if (!map_) return;

            const layers = getLayers(value ?? {});

            this.updateOverlays();
            if (layers.labels) {
                this.restoreBasemapLabels(map_);
            } else {
                this.hideBasemapLabels(map_);
            }
            // if (layers.snowMask) {
            //     this.hideBasemapLabels(map_);
            // } else {
            //     if (layers.labels) {
            //         this.restoreBasemapLabels(map_);
            //     }
            // }
        });
    }
    normalize(v: number, min: number, max: number) {
        if (max === min) return 0.5;
        return (v - min) / (max - min);
    }

    hash(name: string) {
        let h = 0;
        for (let i = 0; i < name.length; i++) {
            h = (h * 31 + name.charCodeAt(i)) >>> 0;
        }
        return h % 100;
    }
    updateBasemap() {
        const map_ = get(this._map);
        if (!map_) return;
        this.buildStyle().then((style) => map_.setStyle(style));
    }
    public updateTraceLayer(
        map_: maplibregl.Map,
        traces
    ) {
        const lengths = traces.map(t => t.distance);

        const min = Math.min(...lengths);
        const max = Math.max(...lengths);

        (
            map_.getSource(
                'traces'
            ) as maplibregl.GeoJSONSource
        ).setData({

            type: 'FeatureCollection',

            features:
                traces.map(
                    t => ({
                        type: 'Feature',

                        properties: {
                            name: t.name,
                            distance: t.distance,
                            lengthNorm: this.normalize(t.distance, min, max)
                        },

                        geometry: {
                            type: 'LineString',
                            coordinates: t.coordinates
                        }

                    })
                )

        });
    }
    private addTracesLayer(map_: maplibregl.Map) {


    }

    private expandedBounds(map_: maplibregl.Map) {

        const b = map_.getBounds();
        const west = b.getWest();
        const east = b.getEast();
        const south = b.getSouth();
        const north = b.getNorth();

        const dx = (east - west) * 0.30;
        const dy = (north - south) * 0.30;

        return {
            west: west - dx,
            south: south - dy,
            east: east + dx,
            north: north + dy
        };
    }

    private viewportInsideLoadedBuffer(map_: maplibregl.Map) {
        if (!this._loadedBBox) return false;

        const b = map_.getBounds();
        return (
            b.getWest() >= this._loadedBBox.west &&
            b.getEast() <= this._loadedBBox.east &&
            b.getSouth() >= this._loadedBBox.south &&
            b.getNorth() <= this._loadedBBox.north
        );
    }

    async openTraceInEditor(name: string) {
        const res = await fetch(`/api/traces/${name}`);
        const trace = await res.json();

        if (!trace.gpx) return;

        const data = new TextEncoder().encode(trace.gpx);

        const file = new File([data], trace.file ?? `${name}.gpx`, {
            type: 'application/gpx+xml'
        });

        // 🔥 PIPELINE OFFICIEL
        await loadFiles([file]);

        // 👉 optionnel mais recommandé
        selection.selectAll();
    }

    private async loadGPXFromString(gpxText: string, filename: string) {
        const data = new TextEncoder().encode(gpxText);

        const file = new File([data], filename, {
            type: 'application/gpx+xml'
        });

        return loadFile(file);
    }

    private cacheBasemapLabels(map_: maplibregl.Map) {
        if (this._basemapLabelLayerIds.length) return;

        const layers = map_.getStyle().layers;
        if (!layers) return;

        this._basemapLabelLayerIds = layers
            .filter(l =>
                l.type === 'symbol' &&
                (l.layout?.['text-field'] || l.layout?.['icon-image']) &&
                !this._protectedLayers.has(l.id) &&
                l.id !== 'summits-poi' &&
                l.id !== 'refuges-poi' &&
                l.id !== 'overpass'
            )
            .map(l => l.id);
    }
    private hideBasemapLabels(map_: maplibregl.Map) {
        if (this._labelsHidden) return;
        console.log("hiding among:", this._basemapLabelLayerIds)
        this.cacheBasemapLabels(map_);

        for (const id of this._basemapLabelLayerIds) {
            if (map_.getLayer(id)) {
                map_.setLayoutProperty(id, 'visibility', 'none');
            }
        }

        this._labelsHidden = true;
    }

    private restoreBasemapLabels(map_: maplibregl.Map) {
        if (!this._labelsHidden) return;

        this.cacheBasemapLabels(map_);

        for (const id of this._basemapLabelLayerIds) {
            if (map_.getLayer(id)) {
                map_.setLayoutProperty(id, 'visibility', 'visible');
            }
        }

        this._labelsHidden = false;
    }

    private handleBivouacClick(feature: maplibregl.MapGeoJSONFeature) {
        const p = feature.properties;

        const data = {
            name: p?.nom,
            status: p?.bivouac,
            rule: p?.reglementation,
            quota: p?.quotas,
            reservable: p?.reservable,
            description: p?.report
        };

        console.log("Bivouac clicked:", data);

        selectedFeature.set({
            type: 'bivouac',
            data,
            loading: false
        });
    }

    private async handleRefugeClick(feature: maplibregl.MapGeoJSONFeature) {
        const props = feature.properties;

        const type = typeof props?.type === 'string'
            ? JSON.parse(props.type)
            : props?.type;

        const coord = typeof props?.coord === 'string'
            ? JSON.parse(props.coord)
            : props?.coord;

        const places = typeof props?.places === 'string'
            ? JSON.parse(props.places)
            : props?.places;

        const base = {
            name: props?.nom,
            type: type?.valeur,
            icon: type?.icone,
            altitude: coord?.alt,
            places: places?.valeur,
            placesLabel: places?.nom,
            link: props?.lien
        };

        console.log("Refuge clicked:", base);

        // 1. état initial
        selectedFeature.set({
            type: 'refuge',
            data: base,
            loading: true
        });

        // 2. fetch async
        const details = await this.fetchPoiDetails(base.link);

        // 3. merge propre (sans reset global)
        selectedFeature.update(current => {
            if (!current || current.type !== 'refuge') return current;

            return {
                ...current,
                details,
                loading: false
            };
        });
    }

    async preloadIcons(map_: maplibregl.Map, features: any[]) {
        const icons = new Set(
            features.map(f => f.properties?.icon).filter(Boolean)
        );

        for (const icon of icons) {
            if (this._loadedIcons.has(icon)) continue;
            if (this._loadingIcons.has(icon)) continue;

            this._loadingIcons.add(icon);

            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = `/icon/${icon}`;

                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 32;
                        canvas.height = 32;

                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject();

                        ctx.drawImage(img, 0, 0, 32, 32);

                        const imageData = ctx.getImageData(0, 0, 32, 32);

                        if (!map_.hasImage(icon)) {
                            map_.addImage(icon, imageData, { pixelRatio: 1 });
                        }

                        this._loadedIcons.add(icon);
                        resolve();
                    };

                    img.onerror = reject;
                });
            } catch (e) {
                console.warn("icon preload failed:", icon);
            } finally {
                this._loadingIcons.delete(icon);
            }
        }
    }

    async fetchPoiDetails(link: string) {
        const res = await fetch(`/refuges/details?url=${encodeURIComponent(link)}`);
        const data = await res.json();

        return {
            sections: data.sections ?? [],
            contact: data.contact ?? null,
            photos: data.photos ?? []
        };
    }

    async addRefugeIcons(map_: maplibregl.Map, features: any[]) {
        const icons = new Set(
            features.map(f => f.properties?.type?.icone).filter(Boolean)
        );

        for (const icon of icons) {
            if (map_.hasImage(icon)) continue;

            const url = `/icon/${icon}`; // ou /icones/${icon}

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    const size = 32;

                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject();

                    ctx.drawImage(img, 0, 0, size, size);

                    const imageData = ctx.getImageData(0, 0, size, size);

                    map_.addImage(icon, imageData as any, {
                        pixelRatio: 1
                    });

                    resolve(null);
                };

                img.onerror = reject;
            });
        }
    }

    private async updateRefuges(map_: maplibregl.Map) {
        const bbox = map_.getBounds().toArray().flat().join(',');
        const res = await fetch(`/refuges?bbox=${bbox}`);
        const geojson = await res.json();

        const geojsonFixed = {
            ...geojson,
            features: geojson.features.map((f: any) => ({
                ...f,
                properties: {
                    ...f.properties,
                    icon: f.properties.type?.icone
                }
            }))
        };

        const source = map_.getSource('refuges') as maplibregl.GeoJSONSource;
        if (!source) return;

        // 🔴 IMPORTANT: preload AVANT setData
        await this.preloadIcons(map_, geojsonFixed.features);

        // ✅ ensuite seulement
        source.setData(geojsonFixed);
    }

    private async updateSummits(map_: maplibregl.Map) {

        // si déjà en cours → on met en attente
        if (this._summitsLoading) {
            this._summitsPending = true;
            return;
        }

        if (map_.getZoom() < 10) return;

        if (this.viewportInsideLoadedBuffer(map_)) {
            return;
        }

        this._summitsLoading = true;

        try {

            const b = this.expandedBounds(map_);
            const bbox = `${b.west},${b.south},${b.east},${b.north}`;

            const res = await fetch(`/api/summits?bbox=${bbox}`);
            const geojson = await res.json();

            const source =
                map_.getSource('summits') as maplibregl.GeoJSONSource;

            if (source) {
                source.setData(geojson);
            }

            this._loadedBBox = b;

        } finally {
            this._summitsLoading = false;
        }

        // 🔥 si un move est arrivé pendant le fetch → on relance UNE fois
        if (this._summitsPending) {
            this._summitsPending = false;
            this.updateSummits(map_);
        }
    }

    private async updateBivouac(map_: maplibregl.Map) {
        // si déjà en cours → on met en attente
        if (this._bivouacLoading) {
            this._bivouacPending = true;
            return;
        }

        if (map_.getZoom() < 8) return;

        // if (this.viewportInsideLoadedBuffer(map_)) {
        //     return;
        // }

        this._bivouacLoading = true;

        try {

            const b = this.expandedBounds(map_);
            const bbox = `${b.west},${b.south},${b.east},${b.north}`;

            const res = await fetch(`/api/bivouac?bbox=${bbox}`);
            const geojson = await res.json();
            const source =
                map_.getSource('bivouac') as maplibregl.GeoJSONSource;

            if (source) {
                source.setData(geojson);
            }

            this._loadedBBox = b;

        } finally {
            this._bivouacLoading = false;
        }

        // 🔥 si un move est arrivé pendant le fetch → on relance UNE fois
        if (this._bivouacPending) {
            this._bivouacPending = false;
            this.updateBivouac(map_);
        }
    }

    async buildStyle(): Promise<maplibregl.StyleSpecification> {
        const custom = get(customLayers);

        const style: maplibregl.StyleSpecification = {
            version: 8,
            projection: {
                type: 'globe',
            },
            sources: {
                'empty-source': emptySource,
            },
            layers: [],
        };

        let basemap = get(currentBasemap);
        const basemapInfo = basemaps[basemap] ?? custom[basemap]?.value ?? basemaps[defaultBasemap];

        let basemapStyle = basemaps.openStreetMap as maplibregl.StyleSpecification;
        try {
            basemapStyle = await this.get(basemapInfo);
        } catch (e) {
            console.error(e.message);
        }
        this.merge(style, basemapStyle);

        if (this._maptilerKey !== '') {
            const terrain = this.getCurrentTerrain();
            style.sources[terrain.source] = terrainSources[terrain.source];
            style.terrain = terrain.exaggeration > 0 ? terrain : undefined;
        }

        style.layers.push(...anchorLayers);

        return style;
    }

    async updateOverlays() {
        const map_ = get(this._map);
        if (!map_) return;
        if (!map_.getSource('empty-source')) return;

        const custom = get(customLayers);
        const overlayOpacities = get(opacities);
        try {
            const layers = getLayers(get(currentOverlays) ?? {});
            for (let overlay in layers) {
                if (!layers[overlay]) {
                    if (this._pastOverlays.has(overlay)) {
                        const overlayInfo = custom[overlay]?.value ?? overlays[overlay];
                        try {
                            const overlayStyle = await this.get(overlayInfo);
                            for (let layer of overlayStyle.layers ?? []) {
                                if (map_.getLayer(layer.id)) {
                                    map_.removeLayer(layer.id);
                                }
                            }
                        } catch (e) {
                            // Should not happen
                        }
                        this._pastOverlays.delete(overlay);
                    }
                } else {
                    const overlayInfo = custom[overlay]?.value ?? overlays[overlay];
                    try {
                        const overlayStyle = await this.get(overlayInfo);
                        const opacity = overlayOpacities[overlay];

                        for (let sourceId in overlayStyle.sources) {
                            if (!map_.getSource(sourceId)) {
                                map_.addSource(sourceId, overlayStyle.sources[sourceId]);
                            }
                        }

                        for (let layer of overlayStyle.layers ?? []) {
                            if (!map_.getLayer(layer.id)) {
                                if (opacity !== undefined) {
                                    if (layer.type === 'raster') {
                                        if (!layer.paint) {
                                            layer.paint = {};
                                        }
                                        layer.paint['raster-opacity'] = opacity;
                                    } else if (layer.type === 'hillshade') {
                                        if (!layer.paint) {
                                            layer.paint = {};
                                        }
                                        layer.paint['hillshade-exaggeration'] = opacity / 2;
                                    }
                                }
                                map_.addLayer(layer, ANCHOR_LAYER_KEY.overlays);
                            }
                        }
                        this._pastOverlays.add(overlay);
                    } catch (e) {
                        console.error(e.message);
                    }
                }
            }
        } catch (e) { }
    }

    updateTerrain() {
        if (this._maptilerKey === '') return;
        const map_ = get(this._map);
        if (!map_) return;

        const mapTerrain = map_.getTerrain();
        const terrain = this.getCurrentTerrain();
        if (JSON.stringify(mapTerrain) !== JSON.stringify(terrain)) {
            if (terrain.exaggeration > 0) {
                if (!map_.getSource(terrain.source)) {
                    map_.addSource(terrain.source, terrainSources[terrain.source]);
                }
                map_.setTerrain(terrain);
            } else {
                map_.setTerrain(null);
            }
        }
    }

    async get(
        styleInfo: maplibregl.StyleSpecification | string
    ): Promise<maplibregl.StyleSpecification> {
        if (typeof styleInfo === 'string') {
            let styleUrl = styleInfo as string;
            if (styleUrl.includes(maptilerKeyPlaceHolder)) {
                styleUrl = styleUrl.replace(maptilerKeyPlaceHolder, this._maptilerKey);
            }
            const response = await fetch(styleUrl, { cache: 'force-cache' });
            if (!response.ok) {
                throw new Error(`HTTP error fetching style "${styleInfo}": ${response.status}`);
            }
            const style = await response.json();
            return style;
        } else {
            return styleInfo;
        }
    }

    merge(style: maplibregl.StyleSpecification, other: maplibregl.StyleSpecification) {
        style.sources = { ...style.sources, ...other.sources };
        for (let layer of other.layers ?? []) {
            if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                const textField = layer.layout['text-field'];
                if (
                    Array.isArray(textField) &&
                    textField.length >= 2 &&
                    textField[0] === 'coalesce' &&
                    Array.isArray(textField[1]) &&
                    textField[1][0] === 'get' &&
                    typeof textField[1][1] === 'string' &&
                    textField[1][1].startsWith('name')
                ) {
                    layer.layout['text-field'] = [
                        'coalesce',
                        ['get', `name:${i18n.lang}`],
                        ['get', 'name'],
                    ];
                }
            }
            style.layers.push(layer);
        }
        if (other.sprite && !style.sprite) {
            style.sprite = other.sprite;
        }
        if (other.glyphs && !style.glyphs) {
            style.glyphs = other.glyphs;
        }
    }

    getCurrentTerrain() {
        const terrain = get(terrainSource);
        const source = terrainSources[terrain];
        if (source.url && source.url.includes(maptilerKeyPlaceHolder)) {
            source.url = source.url.replace(maptilerKeyPlaceHolder, this._maptilerKey);
        }
        const map_ = get(this._map);
        return {
            source: terrain,
            exaggeration: !map_ || map_.getPitch() === 0 ? 0 : 1,
        };
    }
}
