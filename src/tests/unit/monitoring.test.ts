
/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor } from '@/monitoring/PerformanceMonitor';

describe('Tests unitaires - Monitoring', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait batcher les métriques avant envoi', async () => {
    const metrics = Array.from({ length: 5 }, (_, i) => ({
      timestamp: Date.now(),
      operation: `operation_${i}`,
      duration: 100,
      success: true
    }));

    const flushSpy = vi.spyOn(performanceMonitor as any, 'flushMetrics');
    
    for (const metric of metrics) {
      await performanceMonitor.recordMetric(metric);
    }

    expect(flushSpy).not.toHaveBeenCalled();

    // Ajouter 5 métriques de plus pour atteindre le seuil de batch
    for (const metric of metrics) {
      await performanceMonitor.recordMetric(metric);
    }

    expect(flushSpy).toHaveBeenCalled();
  });
});
