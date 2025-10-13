const os = require('os');
const process = require('process');
const EventEmitter = require('events');

class MonitoringService extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      system: {},
      application: {},
      performance: {},
      errors: []
    };
    
    this.healthChecks = new Map();
    this.alerts = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
    
    this.thresholds = {
      cpu: 80, // CPU usage percentage
      memory: 85, // Memory usage percentage
      disk: 90, // Disk usage percentage
      responseTime: 2000, // Response time in milliseconds
      errorRate: 5 // Error rate percentage
    };
  }

  // Start monitoring
  startMonitoring(interval = 30000) {
    if (this.isMonitoring) {
      console.log('Monitoring already running');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkHealth();
      this.checkAlerts();
    }, interval);

    console.log('🔍 Monitoring started');
    this.emit('monitoring_started');
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('🛑 Monitoring stopped');
    this.emit('monitoring_stopped');
  }

  // Collect system metrics
  collectMetrics() {
    try {
      // System metrics
      this.metrics.system = {
        timestamp: new Date(),
        cpu: {
          usage: os.loadavg(),
          cores: os.cpus().length,
          model: os.cpus()[0].model
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        },
        disk: {
          platform: os.platform(),
          arch: os.arch(),
          uptime: os.uptime()
        },
        network: {
          interfaces: os.networkInterfaces()
        }
      };

      // Application metrics
      this.metrics.application = {
        timestamp: new Date(),
        process: {
          pid: process.pid,
          version: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          uptime: process.uptime()
        },
        node: {
          version: process.version,
          arch: process.arch,
          platform: process.platform
        }
      };

      // Performance metrics
      this.metrics.performance = {
        timestamp: new Date(),
        responseTimes: this.getResponseTimes(),
        throughput: this.getThroughput(),
        errorRate: this.getErrorRate(),
        activeConnections: this.getActiveConnections()
      };

      this.emit('metrics_collected', this.metrics);
    } catch (error) {
      console.error('Collect metrics error:', error);
      this.emit('metrics_error', error);
    }
  }

  // Get response times
  getResponseTimes() {
    // This would integrate with actual request tracking
    // For now, return mock data
    return {
      average: Math.random() * 100 + 50,
      p95: Math.random() * 200 + 100,
      p99: Math.random() * 500 + 200
    };
  }

  // Get throughput
  getThroughput() {
    // This would integrate with actual request counting
    return {
      requestsPerSecond: Math.random() * 100 + 50,
      requestsPerMinute: Math.random() * 6000 + 3000
    };
  }

  // Get error rate
  getErrorRate() {
    if (this.metrics.errors.length === 0) return 0;
    
    const recentErrors = this.metrics.errors.filter(
      error => Date.now() - error.timestamp < 60000 // Last minute
    );
    
    return (recentErrors.length / 100) * 100; // Mock calculation
  }

  // Get active connections
  getActiveConnections() {
    // This would integrate with actual connection tracking
    return Math.floor(Math.random() * 100 + 10);
  }

  // Add health check
  addHealthCheck(name, checkFunction, interval = 60000) {
    this.healthChecks.set(name, {
      function: checkFunction,
      interval: interval,
      lastCheck: null,
      status: 'unknown',
      lastError: null
    });

    // Start the health check
    setInterval(async () => {
      await this.runHealthCheck(name);
    }, interval);

    console.log(`Health check added: ${name}`);
  }

  // Run health check
  async runHealthCheck(name) {
    const healthCheck = this.healthChecks.get(name);
    if (!healthCheck) return;

    try {
      const result = await healthCheck.function();
      healthCheck.status = result.healthy ? 'healthy' : 'unhealthy';
      healthCheck.lastCheck = new Date();
      healthCheck.lastError = result.error || null;

      this.emit('health_check_completed', { name, result });
    } catch (error) {
      healthCheck.status = 'error';
      healthCheck.lastCheck = new Date();
      healthCheck.lastError = error.message;

      this.emit('health_check_error', { name, error });
    }
  }

  // Check all health checks
  async checkHealth() {
    const healthStatus = {};

    for (const [name, healthCheck] of this.healthChecks) {
      healthStatus[name] = {
        status: healthCheck.status,
        lastCheck: healthCheck.lastCheck,
        lastError: healthCheck.lastError
      };
    }

    this.emit('health_status', healthStatus);
    return healthStatus;
  }

  // Add alert
  addAlert(alert) {
    this.alerts.push({
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      acknowledged: false
    });

    this.emit('alert_created', alert);
  }

  // Check for alerts
  checkAlerts() {
    const currentMetrics = this.metrics;

    // CPU alert
    if (currentMetrics.system.cpu.usage[0] > this.thresholds.cpu) {
      this.addAlert({
        type: 'high_cpu',
        severity: 'warning',
        message: `High CPU usage: ${currentMetrics.system.cpu.usage[0].toFixed(2)}%`,
        metric: 'cpu',
        value: currentMetrics.system.cpu.usage[0],
        threshold: this.thresholds.cpu
      });
    }

    // Memory alert
    if (currentMetrics.system.memory.usagePercentage > this.thresholds.memory) {
      this.addAlert({
        type: 'high_memory',
        severity: 'warning',
        message: `High memory usage: ${currentMetrics.system.memory.usagePercentage.toFixed(2)}%`,
        metric: 'memory',
        value: currentMetrics.system.memory.usagePercentage,
        threshold: this.thresholds.memory
      });
    }

    // Error rate alert
    const errorRate = this.getErrorRate();
    if (errorRate > this.thresholds.errorRate) {
      this.addAlert({
        type: 'high_error_rate',
        severity: 'critical',
        message: `High error rate: ${errorRate.toFixed(2)}%`,
        metric: 'error_rate',
        value: errorRate,
        threshold: this.thresholds.errorRate
      });
    }
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      this.emit('alert_acknowledged', alert);
    }
  }

  // Get monitoring dashboard data
  getDashboardData() {
    return {
      system: this.metrics.system,
      application: this.metrics.application,
      performance: this.metrics.performance,
      health: this.getHealthStatus(),
      alerts: this.alerts.filter(alert => !alert.acknowledged),
      isMonitoring: this.isMonitoring
    };
  }

  // Get health status
  getHealthStatus() {
    const healthStatus = {};
    let overallStatus = 'healthy';

    for (const [name, healthCheck] of this.healthChecks) {
      healthStatus[name] = {
        status: healthCheck.status,
        lastCheck: healthCheck.lastCheck,
        lastError: healthCheck.lastError
      };

      if (healthCheck.status !== 'healthy') {
        overallStatus = 'unhealthy';
      }
    }

    return {
      overall: overallStatus,
      checks: healthStatus
    };
  }

  // Track request
  trackRequest(req, res, next) {
    const startTime = Date.now();
    const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Add request tracking to response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      this.recordRequest({
        id: requestId,
        method: req.method,
        url: req.url,
        statusCode,
        duration,
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Check for slow requests
      if (duration > this.thresholds.responseTime) {
        this.addAlert({
          type: 'slow_request',
          severity: 'warning',
          message: `Slow request: ${req.method} ${req.url} took ${duration}ms`,
          metric: 'response_time',
          value: duration,
          threshold: this.thresholds.responseTime
        });
      }

      // Check for errors
      if (statusCode >= 400) {
        this.recordError({
          type: 'http_error',
          statusCode,
          url: req.url,
          method: req.method,
          timestamp: new Date(),
          requestId
        });
      }
    });

    next();
  }

  // Record request
  recordRequest(requestData) {
    // Store in memory for now (in production, use a proper database)
    if (!this.metrics.performance.requests) {
      this.metrics.performance.requests = [];
    }

    this.metrics.performance.requests.push(requestData);

    // Keep only last 1000 requests
    if (this.metrics.performance.requests.length > 1000) {
      this.metrics.performance.requests = this.metrics.performance.requests.slice(-1000);
    }
  }

  // Record error
  recordError(errorData) {
    this.metrics.errors.push(errorData);

    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }

    this.emit('error_recorded', errorData);
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const requests = this.metrics.performance.requests || [];
    
    if (requests.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        requestsPerMinute: 0
      };
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentRequests = requests.filter(req => req.timestamp > oneMinuteAgo);
    const errorRequests = requests.filter(req => req.statusCode >= 400);

    const totalDuration = requests.reduce((sum, req) => sum + req.duration, 0);
    const averageResponseTime = totalDuration / requests.length;

    return {
      totalRequests: requests.length,
      averageResponseTime,
      errorRate: (errorRequests.length / requests.length) * 100,
      requestsPerMinute: recentRequests.length
    };
  }

  // Export metrics
  exportMetrics() {
    return {
      timestamp: new Date(),
      system: this.metrics.system,
      application: this.metrics.application,
      performance: this.getPerformanceMetrics(),
      health: this.getHealthStatus(),
      alerts: this.alerts
    };
  }

  // Update thresholds
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.emit('thresholds_updated', this.thresholds);
  }

  // Get system information
  getSystemInfo() {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length
    };
  }
}

module.exports = new MonitoringService(); 