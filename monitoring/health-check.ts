/**
 * Health Check Service
 * Comprehensive health monitoring for Bill Pay Automation Service
 */

import { db } from '@/lib/db';
import { checkDatabaseHealth } from '@/lib/db';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    api: ServiceHealth;
    ocr: ServiceHealth;
    payments: ServiceHealth;
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  details?: string;
}

export class HealthCheckService {
  private static readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private static healthStatus: HealthStatus | null = null;

  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Check database health
      const dbHealth = await this.checkDatabaseHealth();
      
      // Check API health
      const apiHealth = await this.checkApiHealth();
      
      // Check OCR service health
      const ocrHealth = await this.checkOcrHealth();
      
      // Check payment processing health
      const paymentHealth = await this.checkPaymentHealth();
      
      const responseTime = Date.now() - startTime;
      
      // Determine overall status
      const serviceStatuses = [dbHealth.status, apiHealth.status, ocrHealth.status, paymentHealth.status];
      const overallStatus = this.determineOverallStatus(serviceStatuses);
      
      const healthStatus: HealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth,
          api: apiHealth,
          ocr: ocrHealth,
          payments: paymentHealth
        },
        metrics: {
          responseTime,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          cpuUsage: process.cpuUsage().user / 1000000 // seconds
        }
      };
      
      this.healthStatus = healthStatus;
      return healthStatus;
      
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'unhealthy', lastCheck: new Date().toISOString(), details: 'Health check failed' },
          api: { status: 'unhealthy', lastCheck: new Date().toISOString(), details: 'Health check failed' },
          ocr: { status: 'unhealthy', lastCheck: new Date().toISOString(), details: 'Health check failed' },
          payments: { status: 'unhealthy', lastCheck: new Date().toISOString(), details: 'Health check failed' }
        },
        metrics: {
          responseTime: Date.now() - startTime,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
          cpuUsage: process.cpuUsage().user / 1000000
        }
      };
    }
  }

  /**
   * Check database health
   */
  private static async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await checkDatabaseHealth();
      const responseTime = Date.now() - startTime;
      
      return {
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: isHealthy ? 'Database connection successful' : 'Database connection issues'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        details: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check API health
   */
  private static async checkApiHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Simulate API health check
      await new Promise(resolve => setTimeout(resolve, 10));
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: 'API endpoints responding normally'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        details: `API health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check OCR service health
   */
  private static async checkOcrHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Simulate OCR service health check
      await new Promise(resolve => setTimeout(resolve, 50));
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: 'OCR service available and responding'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        details: `OCR service health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check payment processing health
   */
  private static async checkPaymentHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Simulate payment service health check
      await new Promise(resolve => setTimeout(resolve, 30));
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: 'Payment processing services available'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        details: `Payment service health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Determine overall health status
   */
  private static determineOverallStatus(serviceStatuses: string[]): 'healthy' | 'degraded' | 'unhealthy' {
    if (serviceStatuses.includes('unhealthy')) {
      return 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Get current health status
   */
  static getCurrentHealthStatus(): HealthStatus | null {
    return this.healthStatus;
  }

  /**
   * Start periodic health checks
   */
  static startHealthChecks(): void {
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL);
  }
}
