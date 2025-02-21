
/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor } from '@/monitoring/PerformanceMonitor';
import { supabase } from '@/integrations/supabase/client';

describe('Tests unitaires - Embeddings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait enregistrer les métriques de performance', async () => {
    const metric = {
      timestamp: Date.now(),
      operation: 'test_operation',
      duration: 100,
      success: true
    };

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({ data: null, error: null });
    await performanceMonitor.recordMetric(metric);

    expect(mockInvoke).toHaveBeenCalledWith('log-performance-metrics', {
      body: expect.objectContaining({
        metrics: expect.arrayContaining([expect.objectContaining(metric)])
      })
    });
  });
});
