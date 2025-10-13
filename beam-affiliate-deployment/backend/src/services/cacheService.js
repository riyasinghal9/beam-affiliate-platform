const NodeCache = require('node-cache');
const redis = require('redis');

class CacheService {
  constructor() {
    // In-memory cache
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every minute
      useClones: false,
      deleteOnExpire: true
    });

    // Redis client
    this.redisClient = null;
    this.redisEnabled = process.env.REDIS_URL || false;

    this.initializeRedis();
    this.setupEventHandlers();
  }

  // Initialize Redis connection
  async initializeRedis() {
    if (!this.redisEnabled) {
      console.log('Redis not configured, using in-memory cache only');
      return;
    }

    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });

      await this.redisClient.connect();
      console.log('✅ Redis connected successfully');

      // Set up error handling
      this.redisClient.on('error', (err) => {
        console.error('Redis error:', err);
        this.redisEnabled = false;
      });

      this.redisClient.on('reconnecting', () => {
        console.log('Redis reconnecting...');
        this.redisEnabled = true;
      });

    } catch (error) {
      console.error('Redis connection failed:', error);
      this.redisEnabled = false;
    }
  }

  // Setup cache event handlers
  setupEventHandlers() {
    this.memoryCache.on('expired', (key, value) => {
      console.log(`Cache key expired: ${key}`);
    });

    this.memoryCache.on('flush', () => {
      console.log('Memory cache flushed');
    });
  }

  // Set cache value
  async set(key, value, ttl = 300) {
    try {
      // Set in memory cache
      this.memoryCache.set(key, value, ttl);

      // Set in Redis if available
      if (this.redisEnabled && this.redisClient) {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
      }

      return { success: true };
    } catch (error) {
      console.error('Cache set error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get cache value
  async get(key) {
    try {
      // Try memory cache first
      let value = this.memoryCache.get(key);
      
      if (value !== undefined) {
        return { success: true, value, source: 'memory' };
      }

      // Try Redis if available
      if (this.redisEnabled && this.redisClient) {
        const redisValue = await this.redisClient.get(key);
        
        if (redisValue) {
          const parsedValue = JSON.parse(redisValue);
          
          // Update memory cache
          this.memoryCache.set(key, parsedValue, 300);
          
          return { success: true, value: parsedValue, source: 'redis' };
        }
      }

      return { success: false, value: null };
    } catch (error) {
      console.error('Cache get error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete cache value
  async delete(key) {
    try {
      // Delete from memory cache
      this.memoryCache.del(key);

      // Delete from Redis if available
      if (this.redisEnabled && this.redisClient) {
        await this.redisClient.del(key);
      }

      return { success: true };
    } catch (error) {
      console.error('Cache delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all cache
  async clear() {
    try {
      // Clear memory cache
      this.memoryCache.flushAll();

      // Clear Redis if available
      if (this.redisEnabled && this.redisClient) {
        await this.redisClient.flushAll();
      }

      return { success: true };
    } catch (error) {
      console.error('Cache clear error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      const memoryStats = this.memoryCache.getStats();
      
      let redisStats = null;
      if (this.redisEnabled && this.redisClient) {
        const info = await this.redisClient.info();
        redisStats = this.parseRedisInfo(info);
      }

      return {
        success: true,
        memory: {
          keys: memoryStats.keys,
          hits: memoryStats.hits,
          misses: memoryStats.misses,
          hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) * 100
        },
        redis: redisStats,
        redisEnabled: this.redisEnabled
      };
    } catch (error) {
      console.error('Get cache stats error:', error);
      return { success: false, error: error.message };
    }
  }

  // Parse Redis INFO command output
  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const stats = {};

    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    });

    return {
      connectedClients: stats.connected_clients,
      usedMemory: stats.used_memory_human,
      totalCommandsProcessed: stats.total_commands_processed,
      keyspaceHits: stats.keyspace_hits,
      keyspaceMisses: stats.keyspace_misses
    };
  }

  // Cache middleware for Express
  cacheMiddleware(ttl = 300, keyGenerator = null) {
    return async (req, res, next) => {
      try {
        // Generate cache key
        const key = keyGenerator ? keyGenerator(req) : `api:${req.originalUrl}`;
        
        // Try to get from cache
        const cached = await this.get(key);
        
        if (cached.success) {
          return res.json(cached.value);
        }

        // Store original send method
        const originalSend = res.json;
        const cacheService = this;
        
        // Override send method to cache response
        res.json = function(data) {
          // Cache the response
          cacheService.set(key, data, ttl);
          
          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Cache user data
  async cacheUserData(userId, userData, ttl = 1800) {
    const key = `user:${userId}`;
    return this.set(key, userData, ttl);
  }

  // Get cached user data
  async getCachedUserData(userId) {
    const key = `user:${userId}`;
    return this.get(key);
  }

  // Cache analytics data
  async cacheAnalyticsData(key, data, ttl = 3600) {
    const cacheKey = `analytics:${key}`;
    return this.set(cacheKey, data, ttl);
  }

  // Get cached analytics data
  async getCachedAnalyticsData(key) {
    const cacheKey = `analytics:${key}`;
    return this.get(cacheKey);
  }

  // Cache training data
  async cacheTrainingData(key, data, ttl = 7200) {
    const cacheKey = `training:${key}`;
    return this.set(cacheKey, data, ttl);
  }

  // Get cached training data
  async getCachedTrainingData(key) {
    const cacheKey = `training:${key}`;
    return this.get(cacheKey);
  }

  // Cache with tags for easy invalidation
  async setWithTags(key, value, tags = [], ttl = 300) {
    try {
      // Store the value
      await this.set(key, value, ttl);

      // Store tag associations
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        let tagKeys = await this.get(tagKey);
        
        if (!tagKeys.success) {
          tagKeys = { value: [] };
        }
        
        if (!tagKeys.value.includes(key)) {
          tagKeys.value.push(key);
          await this.set(tagKey, tagKeys.value, ttl);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Set with tags error:', error);
      return { success: false, error: error.message };
    }
  }

  // Invalidate cache by tags
  async invalidateByTags(tags) {
    try {
      const keysToDelete = new Set();

      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const tagKeys = await this.get(tagKey);
        
        if (tagKeys.success) {
          tagKeys.value.forEach(key => keysToDelete.add(key));
          await this.delete(tagKey);
        }
      }

      // Delete all associated keys
      for (const key of keysToDelete) {
        await this.delete(key);
      }

      return { success: true, deletedCount: keysToDelete.size };
    } catch (error) {
      console.error('Invalidate by tags error:', error);
      return { success: false, error: error.message };
    }
  }

  // Warm up cache with frequently accessed data
  async warmupCache() {
    try {
      console.log('🔥 Warming up cache...');

      // Cache common data
      const User = require('../models/User');
      const Course = require('../models/Course');
      const Product = require('../models/Product');

      // Cache active users count
      const activeUsersCount = await User.countDocuments({ isActive: true });
      await this.set('stats:active_users', activeUsersCount, 1800);

      // Cache popular courses
      const popularCourses = await Course.find({ isActive: true })
        .sort({ enrolledCount: -1 })
        .limit(10)
        .select('title description category level rating');
      await this.set('courses:popular', popularCourses, 3600);

      // Cache products
      const products = await Product.find({ isActive: true })
        .select('name description price commission category');
      await this.set('products:all', products, 7200);

      console.log('✅ Cache warmup completed');
      return { success: true };
    } catch (error) {
      console.error('Cache warmup error:', error);
      return { success: false, error: error.message };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const memoryStats = this.memoryCache.getStats();
      let redisStatus = 'disabled';

      if (this.redisEnabled && this.redisClient) {
        try {
          await this.redisClient.ping();
          redisStatus = 'connected';
        } catch (error) {
          redisStatus = 'error';
        }
      }

      return {
        success: true,
        status: 'healthy',
        memory: {
          keys: memoryStats.keys,
          hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) * 100
        },
        redis: redisStatus
      };
    } catch (error) {
      console.error('Cache health check error:', error);
      return { success: false, error: error.message };
    }
  }

  // Close connections
  async close() {
    try {
      if (this.redisEnabled && this.redisClient) {
        await this.redisClient.quit();
      }
      
      this.memoryCache.close();
      console.log('Cache service closed');
    } catch (error) {
      console.error('Cache close error:', error);
    }
  }
}

module.exports = new CacheService(); 