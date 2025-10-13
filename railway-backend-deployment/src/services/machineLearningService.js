const MLR = require('ml-regression-multivariate-linear');
const Matrix = require('ml-matrix');
const regression = require('regression');
const stats = require('simple-statistics');

class MachineLearningService {
  constructor() {
    this.models = {
      fraudDetection: null,
      salesPrediction: null,
      userSegmentation: null,
      recommendationEngine: null,
      anomalyDetection: null
    };
    
    this.trainingData = {
      fraud: [],
      sales: [],
      users: [],
      recommendations: [],
      anomalies: []
    };
    
    this.featureConfig = {
      fraud: [
        'clickVelocity',
        'geographicDistance',
        'deviceFingerprint',
        'timePattern',
        'paymentAmount',
        'paymentFrequency',
        'userAge',
        'previousFraudScore'
      ],
      sales: [
        'userLevel',
        'previousSales',
        'marketingSpend',
        'seasonality',
        'competition',
        'economicIndicators'
      ],
      recommendations: [
        'userBehavior',
        'productAffinity',
        'purchaseHistory',
        'socialConnections',
        'demographics'
      ]
    };
  }

  // Fraud Detection Model
  async trainFraudDetectionModel(trainingData) {
    try {
      const features = trainingData.map(data => [
        data.clickVelocity || 0,
        data.geographicDistance || 0,
        data.deviceFingerprint || 0,
        data.timePattern || 0,
        data.paymentAmount || 0,
        data.paymentFrequency || 0,
        data.userAge || 0,
        data.previousFraudScore || 0
      ]);

      const labels = trainingData.map(data => [data.isFraud ? 1 : 0]);

      const X = new Matrix(features);
      const Y = new Matrix(labels);

      this.models.fraudDetection = new MLR(X, Y);
      
      // Calculate model accuracy
      const predictions = this.models.fraudDetection.predict(X);
      const accuracy = this.calculateAccuracy(predictions, labels);
      
      return {
        success: true,
        accuracy: accuracy,
        model: this.models.fraudDetection
      };
    } catch (error) {
      console.error('Error training fraud detection model:', error);
      return { success: false, error: error.message };
    }
  }

  async predictFraud(features) {
    try {
      if (!this.models.fraudDetection) {
        throw new Error('Fraud detection model not trained');
      }

      const featureVector = [
        features.clickVelocity || 0,
        features.geographicDistance || 0,
        features.deviceFingerprint || 0,
        features.timePattern || 0,
        features.paymentAmount || 0,
        features.paymentFrequency || 0,
        features.userAge || 0,
        features.previousFraudScore || 0
      ];

      const prediction = this.models.fraudDetection.predict([featureVector]);
      const fraudProbability = prediction[0][0];
      
      return {
        success: true,
        fraudProbability: Math.max(0, Math.min(1, fraudProbability)),
        riskLevel: this.getRiskLevel(fraudProbability),
        confidence: this.calculateConfidence(features)
      };
    } catch (error) {
      console.error('Error predicting fraud:', error);
      return { success: false, error: error.message };
    }
  }

  // Sales Prediction Model
  async trainSalesPredictionModel(trainingData) {
    try {
      const features = trainingData.map(data => [
        data.userLevel || 0,
        data.previousSales || 0,
        data.marketingSpend || 0,
        data.seasonality || 0,
        data.competition || 0,
        data.economicIndicators || 0
      ]);

      const labels = trainingData.map(data => [data.salesAmount || 0]);

      const X = new Matrix(features);
      const Y = new Matrix(labels);

      this.models.salesPrediction = new MLR(X, Y);
      
      // Calculate R-squared
      const predictions = this.models.salesPrediction.predict(X);
      const rSquared = this.calculateRSquared(predictions, labels);
      
      return {
        success: true,
        rSquared: rSquared,
        model: this.models.salesPrediction
      };
    } catch (error) {
      console.error('Error training sales prediction model:', error);
      return { success: false, error: error.message };
    }
  }

  async predictSales(features) {
    try {
      if (!this.models.salesPrediction) {
        throw new Error('Sales prediction model not trained');
      }

      const featureVector = [
        features.userLevel || 0,
        features.previousSales || 0,
        features.marketingSpend || 0,
        features.seasonality || 0,
        features.competition || 0,
        features.economicIndicators || 0
      ];

      const prediction = this.models.salesPrediction.predict([featureVector]);
      const predictedSales = Math.max(0, prediction[0][0]);
      
      return {
        success: true,
        predictedSales: predictedSales,
        confidence: this.calculateConfidence(features),
        factors: this.analyzeFactors(featureVector)
      };
    } catch (error) {
      console.error('Error predicting sales:', error);
      return { success: false, error: error.message };
    }
  }

  // Recommendation Engine
  async trainRecommendationEngine(trainingData) {
    try {
      // Collaborative filtering approach
      const userProductMatrix = this.buildUserProductMatrix(trainingData);
      const similarityMatrix = this.calculateSimilarityMatrix(userProductMatrix);
      
      this.models.recommendationEngine = {
        userProductMatrix,
        similarityMatrix,
        trainingData
      };
      
      return {
        success: true,
        users: userProductMatrix.length,
        products: userProductMatrix[0]?.length || 0
      };
    } catch (error) {
      console.error('Error training recommendation engine:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecommendations(userId, limit = 5) {
    try {
      if (!this.models.recommendationEngine) {
        throw new Error('Recommendation engine not trained');
      }

      const { userProductMatrix, similarityMatrix } = this.models.recommendationEngine;
      const userIndex = this.findUserIndex(userId);
      
      if (userIndex === -1) {
        return { success: true, recommendations: [] };
      }

      const userSimilarities = similarityMatrix[userIndex];
      const recommendations = this.calculateRecommendations(
        userIndex,
        userSimilarities,
        userProductMatrix,
        limit
      );

      return {
        success: true,
        recommendations: recommendations,
        confidence: this.calculateRecommendationConfidence(userSimilarities)
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return { success: false, error: error.message };
    }
  }

  // Anomaly Detection
  async trainAnomalyDetectionModel(trainingData) {
    try {
      const features = trainingData.map(data => [
        data.value,
        data.timestamp,
        data.frequency,
        data.magnitude
      ]);

      // Calculate statistical parameters
      const values = features.map(f => f[0]);
      const mean = stats.mean(values);
      const stdDev = stats.standardDeviation(values);
      
      this.models.anomalyDetection = {
        mean,
        stdDev,
        threshold: 2.5, // Number of standard deviations
        trainingData: features
      };
      
      return {
        success: true,
        mean: mean,
        stdDev: stdDev,
        threshold: this.models.anomalyDetection.threshold
      };
    } catch (error) {
      console.error('Error training anomaly detection model:', error);
      return { success: false, error: error.message };
    }
  }

  async detectAnomaly(value, context = {}) {
    try {
      if (!this.models.anomalyDetection) {
        throw new Error('Anomaly detection model not trained');
      }

      const { mean, stdDev, threshold } = this.models.anomalyDetection;
      const zScore = Math.abs((value - mean) / stdDev);
      const isAnomaly = zScore > threshold;
      
      return {
        success: true,
        isAnomaly: isAnomaly,
        zScore: zScore,
        threshold: threshold,
        severity: this.getAnomalySeverity(zScore),
        context: context
      };
    } catch (error) {
      console.error('Error detecting anomaly:', error);
      return { success: false, error: error.message };
    }
  }

  // User Segmentation
  async performUserSegmentation(users, features = ['totalSales', 'totalEarnings', 'level', 'activity']) {
    try {
      const userFeatures = users.map(user => 
        features.map(feature => user[feature] || 0)
      );

      // K-means clustering (simplified)
      const clusters = this.kMeansClustering(userFeatures, 4);
      
      const segments = clusters.map((cluster, index) => ({
        id: index + 1,
        name: this.getSegmentName(index),
        users: cluster.length,
        characteristics: this.analyzeCluster(cluster, features),
        averageValue: stats.mean(cluster.map(u => u[features[0]] || 0))
      }));

      return {
        success: true,
        segments: segments,
        totalUsers: users.length,
        features: features
      };
    } catch (error) {
      console.error('Error performing user segmentation:', error);
      return { success: false, error: error.message };
    }
  }

  // Predictive Analytics
  async generatePredictiveInsights(userId, timeRange = '30d') {
    try {
      const insights = {
        salesForecast: await this.predictSalesForecast(userId, timeRange),
        churnRisk: await this.predictChurnRisk(userId),
        lifetimeValue: await this.predictLifetimeValue(userId),
        nextBestAction: await this.getNextBestAction(userId),
        opportunities: await this.identifyOpportunities(userId)
      };

      return {
        success: true,
        insights: insights,
        confidence: this.calculateOverallConfidence(insights)
      };
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  calculateAccuracy(predictions, actuals) {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      const predicted = predictions[i][0] > 0.5 ? 1 : 0;
      const actual = actuals[i][0];
      if (predicted === actual) correct++;
    }
    return correct / predictions.length;
  }

  calculateRSquared(predictions, actuals) {
    const ssRes = predictions.reduce((sum, pred, i) => 
      sum + Math.pow(pred[0] - actuals[i][0], 2), 0
    );
    const ssTot = actuals.reduce((sum, actual) => 
      sum + Math.pow(actual[0] - stats.mean(actuals.map(a => a[0])), 2), 0
    );
    return 1 - (ssRes / ssTot);
  }

  getRiskLevel(probability) {
    if (probability < 0.3) return 'low';
    if (probability < 0.7) return 'medium';
    return 'high';
  }

  calculateConfidence(features) {
    // Calculate confidence based on feature completeness and quality
    const featureCount = Object.keys(features).length;
    const completeness = featureCount / this.featureConfig.fraud.length;
    return Math.min(0.95, Math.max(0.1, completeness));
  }

  buildUserProductMatrix(data) {
    // Build user-product interaction matrix
    const users = [...new Set(data.map(d => d.userId))];
    const products = [...new Set(data.map(d => d.productId))];
    
    const matrix = users.map(() => new Array(products.length).fill(0));
    
    data.forEach(interaction => {
      const userIndex = users.indexOf(interaction.userId);
      const productIndex = products.indexOf(interaction.productId);
      if (userIndex !== -1 && productIndex !== -1) {
        matrix[userIndex][productIndex] = interaction.rating || 1;
      }
    });
    
    return matrix;
  }

  calculateSimilarityMatrix(matrix) {
    const similarityMatrix = [];
    
    for (let i = 0; i < matrix.length; i++) {
      similarityMatrix[i] = [];
      for (let j = 0; j < matrix.length; j++) {
        if (i === j) {
          similarityMatrix[i][j] = 1;
        } else {
          similarityMatrix[i][j] = this.cosineSimilarity(matrix[i], matrix[j]);
        }
      }
    }
    
    return similarityMatrix;
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
  }

  findUserIndex(userId) {
    // Implementation depends on how user IDs are mapped to matrix indices
    return 0; // Placeholder
  }

  calculateRecommendations(userIndex, similarities, matrix, limit) {
    // Find most similar users and their product preferences
    const similarUsers = similarities
      .map((sim, index) => ({ index, similarity: sim }))
      .filter(u => u.index !== userIndex)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    const recommendations = [];
    const userProducts = matrix[userIndex];
    
    for (let productIndex = 0; productIndex < userProducts.length; productIndex++) {
      if (userProducts[productIndex] === 0) { // User hasn't interacted with this product
        let score = 0;
        let totalSimilarity = 0;
        
        similarUsers.forEach(({ index, similarity }) => {
          score += matrix[index][productIndex] * similarity;
          totalSimilarity += similarity;
        });
        
        if (totalSimilarity > 0) {
          recommendations.push({
            productIndex,
            score: score / totalSimilarity
          });
        }
      }
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateRecommendationConfidence(similarities) {
    const topSimilarities = similarities
      .sort((a, b) => b - a)
      .slice(0, 5);
    return stats.mean(topSimilarities);
  }

  getAnomalySeverity(zScore) {
    if (zScore > 4) return 'critical';
    if (zScore > 3) return 'high';
    if (zScore > 2) return 'medium';
    return 'low';
  }

  kMeansClustering(data, k) {
    // Simplified k-means implementation
    const clusters = Array.from({ length: k }, () => []);
    const centroids = this.initializeCentroids(data, k);
    
    // Assign points to clusters
    data.forEach(point => {
      const distances = centroids.map(centroid => 
        this.euclideanDistance(point, centroid)
      );
      const clusterIndex = distances.indexOf(Math.min(...distances));
      clusters[clusterIndex].push(point);
    });
    
    return clusters;
  }

  initializeCentroids(data, k) {
    const centroids = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      centroids.push([...data[randomIndex]]);
    }
    return centroids;
  }

  euclideanDistance(pointA, pointB) {
    return Math.sqrt(
      pointA.reduce((sum, a, i) => sum + Math.pow(a - pointB[i], 2), 0)
    );
  }

  getSegmentName(index) {
    const names = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    return names[index] || `Segment ${index + 1}`;
  }

  analyzeCluster(cluster, features) {
    const characteristics = {};
    features.forEach((feature, index) => {
      const values = cluster.map(point => point[index]);
      characteristics[feature] = {
        mean: stats.mean(values),
        median: stats.median(values),
        stdDev: stats.standardDeviation(values)
      };
    });
    return characteristics;
  }

  async predictSalesForecast(userId, timeRange) {
    // Placeholder for sales forecasting
    return {
      next30Days: Math.random() * 1000,
      next90Days: Math.random() * 3000,
      growthRate: Math.random() * 0.2 - 0.1
    };
  }

  async predictChurnRisk(userId) {
    // Placeholder for churn prediction
    return {
      risk: Math.random(),
      factors: ['inactivity', 'low_engagement'],
      recommendations: ['increase_engagement', 'personalized_content']
    };
  }

  async predictLifetimeValue(userId) {
    // Placeholder for LTV prediction
    return {
      predictedLTV: Math.random() * 10000,
      confidence: Math.random(),
      factors: ['purchase_history', 'engagement_level']
    };
  }

  async getNextBestAction(userId) {
    // Placeholder for next best action
    return {
      action: 'send_personalized_offer',
      priority: 'high',
      expectedValue: Math.random() * 500
    };
  }

  async identifyOpportunities(userId) {
    // Placeholder for opportunity identification
    return [
      {
        type: 'cross_sell',
        product: 'premium_package',
        probability: Math.random(),
        value: Math.random() * 200
      }
    ];
  }

  calculateOverallConfidence(insights) {
    const confidences = Object.values(insights)
      .filter(insight => insight.confidence)
      .map(insight => insight.confidence);
    
    return confidences.length > 0 ? stats.mean(confidences) : 0.5;
  }

  analyzeFactors(featureVector) {
    // Analyze which factors contribute most to the prediction
    return featureVector.map((value, index) => ({
      factor: this.featureConfig.sales[index],
      value: value,
      impact: value * Math.random() // Simplified impact calculation
    }));
  }

  // Model persistence
  async saveModel(modelName, model) {
    try {
      // In production, save to database or file system
      this.models[modelName] = model;
      return { success: true };
    } catch (error) {
      console.error('Error saving model:', error);
      return { success: false, error: error.message };
    }
  }

  async loadModel(modelName) {
    try {
      // In production, load from database or file system
      return { success: true, model: this.models[modelName] };
    } catch (error) {
      console.error('Error loading model:', error);
      return { success: false, error: error.message };
    }
  }

  // Model evaluation
  async evaluateModel(modelName, testData) {
    try {
      const metrics = {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0
      };

      // Calculate metrics based on model type
      switch (modelName) {
        case 'fraudDetection':
          metrics.accuracy = this.calculateAccuracy(testData.predictions, testData.actuals);
          break;
        case 'salesPrediction':
          metrics.rSquared = this.calculateRSquared(testData.predictions, testData.actuals);
          break;
        default:
          metrics.accuracy = Math.random(); // Placeholder
      }

      return { success: true, metrics };
    } catch (error) {
      console.error('Error evaluating model:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new MachineLearningService(); 