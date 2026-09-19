import { ComplaintRecord, HexBin, SpatialCluster, ComplaintCategory } from '../types';

export class GeospatialEngine {
  /**
   * Generates hexagonal-like grid bins over the bounding area of complaints
   */
  public static computeHexBins(complaints: ComplaintRecord[], gridResolution: number = 0.007): HexBin[] {
    if (complaints.length === 0) return [];

    const bins = new Map<string, { latSum: number; lngSum: number; count: number; criticalCount: number; categories: Record<string, number> }>();

    for (const c of complaints) {
      const { lat, lng } = c.location;
      // Quantize coordinates to grid
      const gridX = Math.round(lng / gridResolution);
      const gridY = Math.round(lat / gridResolution);
      const key = `${gridX}_${gridY}`;

      let bin = bins.get(key);
      if (!bin) {
        bin = { latSum: 0, lngSum: 0, count: 0, criticalCount: 0, categories: {} };
        bins.set(key, bin);
      }

      bin.latSum += lat;
      bin.lngSum += lng;
      bin.count++;
      if (c.priority === 'CRITICAL') bin.criticalCount++;
      bin.categories[c.category] = (bin.categories[c.category] || 0) + 1;
    }

    let maxCount = 1;
    for (const b of bins.values()) {
      if (b.count > maxCount) maxCount = b.count;
    }

    const hexBins: HexBin[] = [];
    let idx = 0;
    for (const [key, bin] of bins.entries()) {
      let dominantCategory = 'General';
      let maxCatCount = 0;
      for (const [cat, cnt] of Object.entries(bin.categories)) {
        if (cnt > maxCatCount) {
          maxCatCount = cnt;
          dominantCategory = cat;
        }
      }

      hexBins.push({
        id: `hex-${idx++}`,
        lat: bin.latSum / bin.count,
        lng: bin.lngSum / bin.count,
        count: bin.count,
        criticalCount: bin.criticalCount,
        dominantCategory,
        intensity: Math.min(1, Math.round((bin.count / maxCount) * 100) / 100),
      });
    }

    return hexBins.sort((a, b) => b.count - a.count);
  }

  /**
   * DBSCAN-style density clustering to identify localized high-density incident clusters
   */
  public static computeSpatialClusters(complaints: ComplaintRecord[], maxDistanceKm: number = 0.65, minPoints: number = 4): SpatialCluster[] {
    const active = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
    if (active.length < minPoints) return [];

    const visited = new Set<string>();
    const clusters: SpatialCluster[] = [];

    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let clusterId = 1;

    for (let i = 0; i < active.length; i++) {
      const point = active[i];
      if (visited.has(point.id)) continue;

      // Find neighbors
      const neighbors: ComplaintRecord[] = [];
      for (let j = 0; j < active.length; j++) {
        const other = active[j];
        const dist = haversineKm(point.location.lat, point.location.lng, other.location.lat, other.location.lng);
        if (dist <= maxDistanceKm) {
          neighbors.push(other);
        }
      }

      if (neighbors.length >= minPoints) {
        // Expand cluster
        const currentClusterPoints: ComplaintRecord[] = [];
        for (const n of neighbors) {
          if (!visited.has(n.id)) {
            visited.add(n.id);
            currentClusterPoints.push(n);
          }
        }

        if (currentClusterPoints.length >= minPoints) {
          let sumLat = 0;
          let sumLng = 0;
          let criticalCount = 0;
          const catMap: Record<string, number> = {};

          for (const cp of currentClusterPoints) {
            sumLat += cp.location.lat;
            sumLng += cp.location.lng;
            if (cp.priority === 'CRITICAL') criticalCount++;
            catMap[cp.category] = (catMap[cp.category] || 0) + 1;
          }

          let dominantCat: ComplaintCategory = point.category;
          let maxCount = 0;
          for (const [c, cnt] of Object.entries(catMap)) {
            if (cnt > maxCount) {
              maxCount = cnt;
              dominantCat = c as ComplaintCategory;
            }
          }

          const centerLat = sumLat / currentClusterPoints.length;
          const centerLng = sumLng / currentClusterPoints.length;

          // Estimate radius
          let maxDistInCluster = 0.2;
          for (const cp of currentClusterPoints) {
            const d = haversineKm(centerLat, centerLng, cp.location.lat, cp.location.lng);
            if (d > maxDistInCluster) maxDistInCluster = d;
          }

          const severity = criticalCount >= 2 ? 'CRITICAL' : currentClusterPoints.length >= 8 ? 'HIGH' : 'MEDIUM';

          clusters.push({
            id: `clust-${clusterId++}`,
            centerLat: Math.round(centerLat * 100000) / 100000,
            centerLng: Math.round(centerLng * 100000) / 100000,
            radiusMeters: Math.round(maxDistInCluster * 1000),
            pointCount: currentClusterPoints.length,
            category: dominantCat,
            severity,
            label: `${dominantCat} Hotspot (${currentClusterPoints.length} active cases)`,
          });
        }
      }
    }

    return clusters.sort((a, b) => b.pointCount - a.pointCount);
  }
}
