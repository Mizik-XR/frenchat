
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetrics {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  cacheHit?: boolean;
  error?: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly BATCH_SIZE = 10;
  private flushInterval: number;

  private constructor() {
    this.flushInterval = setInterval(() => this.flushMetrics(), 600000); // 10 minutes
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public async recordMetric(metric: PerformanceMetrics): Promise<void> {
    this.metrics.push(metric);
    
    if (this.metrics.length >= this.BATCH_SIZE) {
      await this.flushMetrics();
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      const { error } = await supabase.functions.invoke('log-performance-metrics', {
        body: { metrics: metricsToSend }
      });

      if (error) {
        console.error('Erreur lors de l\'envoi des métriques:', error);
        // Remettre les métriques dans la file si l'envoi échoue
        this.metrics = [...metricsToSend, ...this.metrics];
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des métriques:', error);
      this.metrics = [...metricsToSend, ...this.metrics];
    }
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
