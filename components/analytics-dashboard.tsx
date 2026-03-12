"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointerClick,
  Layers,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Share2,
  Download,
} from "lucide-react"
import type { Slide } from "@/types/editor"

interface AnalyticsData {
  totalViews: number
  uniqueViewers: number
  avgTimeSpent: number // in seconds
  totalTimeSpent: number // in seconds
  completionRate: number // percentage
  shareCount: number
  downloadCount: number
  slideMetrics: SlideMetric[]
  viewsOverTime: ViewDataPoint[]
  engagementScore: number // 0-100
  peakViewingHour: number // 0-23
  topReferrers: Referrer[]
  deviceBreakdown: DeviceStats
}

interface SlideMetric {
  slideId: string
  slideIndex: number
  views: number
  avgDuration: number // seconds
  exitRate: number // percentage who left on this slide
  interactionCount: number
}

interface ViewDataPoint {
  date: string
  views: number
  uniqueVisitors: number
}

interface Referrer {
  source: string
  count: number
  percentage: number
}

interface DeviceStats {
  desktop: number
  mobile: number
  tablet: number
}

interface AnalyticsDashboardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slides: Slide[]
  presentationId?: string
  presentationTitle: string
}

// Generate mock analytics data for demo purposes
function generateMockAnalytics(slides: Slide[]): AnalyticsData {
  const totalViews = Math.floor(Math.random() * 2000) + 500
  const uniqueViewers = Math.floor(totalViews * (0.6 + Math.random() * 0.3))
  const avgTimeSpent = Math.floor(Math.random() * 180) + 60
  
  const slideMetrics: SlideMetric[] = slides.map((slide, index) => ({
    slideId: slide.id,
    slideIndex: index,
    views: Math.floor(totalViews * (1 - index * 0.05)),
    avgDuration: Math.floor(Math.random() * 30) + 10,
    exitRate: Math.random() * 15 + (index * 2),
    interactionCount: Math.floor(Math.random() * 100) + 20,
  }))

  const viewsOverTime: ViewDataPoint[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    viewsOverTime.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Math.floor(Math.random() * 200) + 50,
      uniqueVisitors: Math.floor(Math.random() * 150) + 30,
    })
  }

  return {
    totalViews,
    uniqueViewers,
    avgTimeSpent,
    totalTimeSpent: totalViews * avgTimeSpent,
    completionRate: Math.random() * 30 + 60,
    shareCount: Math.floor(Math.random() * 50) + 10,
    downloadCount: Math.floor(Math.random() * 30) + 5,
    slideMetrics,
    viewsOverTime,
    engagementScore: Math.floor(Math.random() * 30) + 65,
    peakViewingHour: Math.floor(Math.random() * 8) + 9, // 9am - 5pm
    topReferrers: [
      { source: "Direct Link", count: Math.floor(totalViews * 0.4), percentage: 40 },
      { source: "Email", count: Math.floor(totalViews * 0.25), percentage: 25 },
      { source: "Social Media", count: Math.floor(totalViews * 0.2), percentage: 20 },
      { source: "Embedded", count: Math.floor(totalViews * 0.1), percentage: 10 },
      { source: "Other", count: Math.floor(totalViews * 0.05), percentage: 5 },
    ],
    deviceBreakdown: {
      desktop: 65,
      mobile: 28,
      tablet: 7,
    },
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) return `${mins}m ${secs}s`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}h ${remainingMins}m`
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "cyan"
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
    pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
  }

  const iconBgColors = {
    blue: "bg-blue-500/20",
    green: "bg-green-500/20",
    purple: "bg-purple-500/20",
    orange: "bg-orange-500/20",
    pink: "bg-pink-500/20",
    cyan: "bg-cyan-500/20",
  }

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBgColors[color]}`}>
          <Icon className={`h-5 w-5 ${colorClasses[color].split(" ").pop()}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400"}`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-100 mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

function MiniBarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-blue-500/60 to-blue-400/40 rounded-t transition-all duration-300 hover:from-blue-500/80 hover:to-blue-400/60"
          style={{ height: `${(value / maxValue) * 100}%` }}
        />
      ))}
    </div>
  )
}

function EngagementRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-gray-400">Score</span>
      </div>
    </div>
  )
}

export function AnalyticsDashboard({
  open,
  onOpenChange,
  slides,
  presentationTitle,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Generate mock data (in real app, this would come from API)
  const analytics = useMemo(() => generateMockAnalytics(slides), [slides])

  const maxViews = Math.max(...analytics.viewsOverTime.map((d) => d.views))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] bg-gray-900/95 border-gray-800 text-gray-100 p-0 overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-800/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                Analytics Dashboard
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Track performance for "{presentationTitle}"
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4">
              <TabsList className="bg-gray-800/50 border border-gray-700/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  <Activity className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="slides" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  <Layers className="h-4 w-4 mr-2" />
                  Slide Metrics
                </TabsTrigger>
                <TabsTrigger value="audience" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  <Users className="h-4 w-4 mr-2" />
                  Audience
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
              <ScrollArea className="h-full pr-4">
                {/* Top Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Total Views"
                    value={analytics.totalViews.toLocaleString()}
                    icon={Eye}
                    trend="up"
                    trendValue="+12.5%"
                    color="blue"
                  />
                  <StatCard
                    title="Unique Viewers"
                    value={analytics.uniqueViewers.toLocaleString()}
                    icon={Users}
                    trend="up"
                    trendValue="+8.3%"
                    color="green"
                  />
                  <StatCard
                    title="Avg. Time Spent"
                    value={formatDuration(analytics.avgTimeSpent)}
                    icon={Clock}
                    trend="neutral"
                    color="purple"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${analytics.completionRate.toFixed(1)}%`}
                    icon={Target}
                    trend="up"
                    trendValue="+5.2%"
                    color="orange"
                  />
                </div>

                {/* Views Chart and Engagement */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Views Over Time */}
                  <div className="lg:col-span-2 p-5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                        Views Over Time
                      </h3>
                      <Badge variant="outline" className="text-gray-400 border-gray-600">
                        Last 14 days
                      </Badge>
                    </div>
                    <MiniBarChart
                      data={analytics.viewsOverTime.map((d) => d.views)}
                      maxValue={maxViews}
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{analytics.viewsOverTime[0]?.date}</span>
                      <span>{analytics.viewsOverTime[analytics.viewsOverTime.length - 1]?.date}</span>
                    </div>
                  </div>

                  {/* Engagement Score */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                    <h3 className="font-semibold text-gray-200 flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-purple-400" />
                      Engagement Score
                    </h3>
                    <div className="flex justify-center">
                      <EngagementRing score={analytics.engagementScore} />
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-4">
                      {analytics.engagementScore >= 80
                        ? "Excellent engagement!"
                        : analytics.engagementScore >= 60
                        ? "Good engagement"
                        : "Room for improvement"}
                    </p>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Shares"
                    value={analytics.shareCount}
                    icon={Share2}
                    color="pink"
                  />
                  <StatCard
                    title="Downloads"
                    value={analytics.downloadCount}
                    icon={Download}
                    color="cyan"
                  />
                  <StatCard
                    title="Peak Hour"
                    value={`${analytics.peakViewingHour}:00`}
                    subtitle="Most active viewing time"
                    icon={Calendar}
                    color="orange"
                  />
                  <StatCard
                    title="Total Watch Time"
                    value={formatDuration(Math.floor(analytics.totalTimeSpent / 60))}
                    subtitle="Combined viewer time"
                    icon={Clock}
                    color="green"
                  />
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Slide Metrics Tab */}
            <TabsContent value="slides" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {analytics.slideMetrics.map((metric, index) => (
                    <div
                      key={metric.slideId}
                      className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <span className="font-bold text-blue-400">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-200">Slide {index + 1}</h4>
                            <p className="text-xs text-gray-500">
                              {slides[index]?.elements.length || 0} elements
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {metric.exitRate > 10 && (
                            <Badge variant="outline" className="text-orange-400 border-orange-500/50 bg-orange-500/10">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              High Exit Rate
                            </Badge>
                          )}
                          {metric.interactionCount > 80 && (
                            <Badge variant="outline" className="text-green-400 border-green-500/50 bg-green-500/10">
                              <MousePointerClick className="h-3 w-3 mr-1" />
                              High Engagement
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-2 rounded-lg bg-gray-900/50">
                          <div className="text-lg font-semibold text-gray-100">{metric.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-gray-900/50">
                          <div className="text-lg font-semibold text-gray-100">{formatDuration(metric.avgDuration)}</div>
                          <div className="text-xs text-gray-500">Avg. Duration</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-gray-900/50">
                          <div className="text-lg font-semibold text-gray-100">{metric.exitRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Exit Rate</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-gray-900/50">
                          <div className="text-lg font-semibold text-gray-100">{metric.interactionCount}</div>
                          <div className="text-xs text-gray-500">Interactions</div>
                        </div>
                      </div>

                      {/* Progress bar showing relative views */}
                      <div className="mt-3">
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${(metric.views / analytics.totalViews) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Traffic Sources */}
                  <div className="p-5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                    <h3 className="font-semibold text-gray-200 flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      Traffic Sources
                    </h3>
                    <div className="space-y-3">
                      {analytics.topReferrers.map((referrer, i) => (
                        <div key={referrer.source} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-sm font-medium text-gray-400">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-200">{referrer.source}</span>
                              <span className="text-sm text-gray-400">{referrer.count.toLocaleString()} ({referrer.percentage}%)</span>
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                style={{ width: `${referrer.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device Breakdown */}
                  <div className="p-5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                    <h3 className="font-semibold text-gray-200 flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-blue-400" />
                      Device Breakdown
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Desktop</span>
                          <span className="text-sm text-gray-400">{analytics.deviceBreakdown.desktop}%</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                            style={{ width: `${analytics.deviceBreakdown.desktop}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Mobile</span>
                          <span className="text-sm text-gray-400">{analytics.deviceBreakdown.mobile}%</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                            style={{ width: `${analytics.deviceBreakdown.mobile}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Tablet</span>
                          <span className="text-sm text-gray-400">{analytics.deviceBreakdown.tablet}%</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"
                            style={{ width: `${analytics.deviceBreakdown.tablet}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Viewing Patterns */}
                  <div className="lg:col-span-2 p-5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                    <h3 className="font-semibold text-gray-200 flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-orange-400" />
                      Viewing Patterns
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-gray-900/50 text-center">
                        <div className="text-2xl font-bold text-orange-400">{analytics.peakViewingHour}:00</div>
                        <div className="text-xs text-gray-500 mt-1">Peak Viewing Hour</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-900/50 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {Math.floor(analytics.avgTimeSpent / slides.length)}s
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Avg. Per Slide</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-900/50 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {((analytics.uniqueViewers / analytics.totalViews) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Return Viewers</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-900/50 text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {slides.length > 0 ? Math.ceil(analytics.completionRate / 10) : 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Avg. Slides Viewed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
