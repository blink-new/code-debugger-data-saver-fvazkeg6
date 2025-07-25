import React, { useState, useEffect, useCallback } from 'react'
import { TrendingUp, AlertCircle, CheckCircle, Brain, BarChart3, Target, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { blink } from '@/blink/client'
import type { AIPattern, AILearningMetric } from '@/types'

interface PatternInsight {
  id: string
  type: 'recurring_error' | 'solution_pattern' | 'performance_trend' | 'learning_improvement'
  title: string
  description: string
  frequency: number
  confidence: number
  trend: 'increasing' | 'decreasing' | 'stable'
  actionable: boolean
  relatedPatterns: string[]
}

export function PatternRecognition() {
  const [patterns, setPatterns] = useState<AIPattern[]>([])
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [metrics, setMetrics] = useState<AILearningMetric[]>([])
  const [loading, setLoading] = useState(true)

  const generateInsights = useCallback(async (patternsData: AIPattern[]): Promise<PatternInsight[]> => {
    const insights: PatternInsight[] = []

    // Find recurring error patterns
    const errorPatterns = patternsData.filter(p => p.patternType === 'error' && p.frequency > 2)
    errorPatterns.forEach(pattern => {
      insights.push({
        id: `insight_${pattern.id}`,
        type: 'recurring_error',
        title: 'Recurring Error Pattern Detected',
        description: `This error pattern has occurred ${pattern.frequency} times with ${Math.round(pattern.confidenceScore * 100)}% confidence`,
        frequency: pattern.frequency,
        confidence: pattern.confidenceScore,
        trend: 'increasing',
        actionable: true,
        relatedPatterns: [pattern.id]
      })
    })

    // Find solution patterns
    const solutionPatterns = patternsData.filter(p => p.patternType === 'solution' && p.confidenceScore > 0.8)
    if (solutionPatterns.length > 0) {
      insights.push({
        id: 'high_confidence_solutions',
        type: 'solution_pattern',
        title: 'High-Confidence Solutions Available',
        description: `Found ${solutionPatterns.length} solution patterns with >80% confidence`,
        frequency: solutionPatterns.length,
        confidence: solutionPatterns.reduce((acc, p) => acc + p.confidenceScore, 0) / solutionPatterns.length,
        trend: 'stable',
        actionable: true,
        relatedPatterns: solutionPatterns.map(p => p.id)
      })
    }

    // Performance trends
    const performancePatterns = patternsData.filter(p => p.patternType === 'performance')
    if (performancePatterns.length > 0) {
      insights.push({
        id: 'performance_trends',
        type: 'performance_trend',
        title: 'Performance Patterns Identified',
        description: `Analyzing ${performancePatterns.length} performance-related patterns`,
        frequency: performancePatterns.length,
        confidence: 0.75,
        trend: 'stable',
        actionable: true,
        relatedPatterns: performancePatterns.map(p => p.id)
      })
    }

    return insights
  }, [])

  const loadPatternData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load AI patterns
      const patternsData = await blink.db.aiPatterns.list({
        orderBy: { frequency: 'desc' },
        limit: 50
      })
      setPatterns(patternsData)

      // Load learning metrics
      const metricsData = await blink.db.aiLearningMetrics.list({
        orderBy: { recordedAt: 'desc' },
        limit: 100
      })
      setMetrics(metricsData)

      // Generate insights from patterns
      const generatedInsights = await generateInsights(patternsData)
      setInsights(generatedInsights)

    } catch (error) {
      console.error('Failed to load pattern data:', error)
    } finally {
      setLoading(false)
    }
  }, [generateInsights])

  useEffect(() => {
    loadPatternData()
  }, [loadPatternData])

  const getPatternTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'solution': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'performance': return <Zap className="h-4 w-4 text-yellow-500" />
      case 'code_issue': return <Target className="h-4 w-4 text-orange-500" />
      default: return <Brain className="h-4 w-4 text-blue-500" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />
    }
  }

  const calculateLearningProgress = () => {
    if (metrics.length === 0) return 0
    
    const recentMetrics = metrics.slice(0, 10)
    const averageScore = recentMetrics.reduce((acc, m) => acc + m.metricValue, 0) / recentMetrics.length
    return Math.round(averageScore * 100)
  }

  const getTopErrorTypes = () => {
    const errorPatterns = patterns.filter(p => p.patternType === 'error')
    const errorTypes: { [key: string]: number } = {}
    
    errorPatterns.forEach(pattern => {
      try {
        const data = JSON.parse(pattern.patternData)
        const errorType = data.errorType || 'Unknown'
        errorTypes[errorType] = (errorTypes[errorType] || 0) + pattern.frequency
      } catch (e) {
        // Skip invalid JSON
      }
    })

    return Object.entries(errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const learningProgress = calculateLearningProgress()
  const topErrorTypes = getTopErrorTypes()

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Patterns
                </p>
                <p className="text-2xl font-bold">{patterns.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Learning Progress
                </p>
                <p className="text-2xl font-bold">{learningProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={learningProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Insights
                </p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Confidence
                </p>
                <p className="text-2xl font-bold">
                  {patterns.length > 0 
                    ? Math.round((patterns.reduce((acc, p) => acc + p.confidenceScore, 0) / patterns.length) * 100)
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="trends">Error Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights available yet. Keep debugging to generate AI insights!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTrendIcon(insight.trend)}
                            <h3 className="font-medium">{insight.title}</h3>
                            <Badge variant={insight.actionable ? "default" : "secondary"}>
                              {insight.actionable ? "Actionable" : "Informational"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Frequency: {insight.frequency}</span>
                            <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                            <span>Trend: {insight.trend}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {patterns.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No patterns detected yet. Start debugging to build your pattern database!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patterns.slice(0, 10).map((pattern) => (
                    <div
                      key={pattern.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getPatternTypeIcon(pattern.patternType)}
                        <div>
                          <p className="font-medium capitalize">{pattern.patternType} Pattern</p>
                          <p className="text-sm text-slate-500">
                            Last seen: {new Date(pattern.lastSeen).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">×{pattern.frequency}</p>
                        <p className="text-sm text-slate-500">
                          {Math.round(pattern.confidenceScore * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Error Types</CardTitle>
            </CardHeader>
            <CardContent>
              {topErrorTypes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No error trends available yet. Debug some errors to see patterns!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topErrorTypes.map(({ type, count }, index) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((count / Math.max(...topErrorTypes.map(t => t.count))) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}