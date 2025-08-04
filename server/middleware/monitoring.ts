import { Request, Response, NextFunction } from 'express';

// Performance: Request monitoring and logging
interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userAgent?: string;
  ip: string;
}

class PerformanceMonitor {
  private metrics: RequestMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  addMetric(metric: RequestMetrics) {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics to prevent memory leaks
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / this.metrics.length;
  }

  getSlowRequests(threshold: number = 1000): RequestMetrics[] {
    return this.metrics.filter(metric => metric.duration > threshold);
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) return 0;
    const errorCount = this.metrics.filter(metric => metric.statusCode >= 400).length;
    return (errorCount / this.metrics.length) * 100;
  }

  getMetricsSummary() {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      slowRequests: this.getSlowRequests().length,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const metric: RequestMetrics = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
    };
    
    performanceMonitor.addMetric(metric);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// Performance: Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  const summary = performanceMonitor.getMetricsSummary();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: summary,
  });
};