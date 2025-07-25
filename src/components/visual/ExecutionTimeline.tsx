import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Slider } from '../ui/slider'
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Clock,
  Activity,
  Zap,
  Eye,
  AlertTriangle,
  FileText,
  CheckCircle,
  MemoryStick,
  Bookmark,
  MessageSquare
} from 'lucide-react'
import { blink } from '../../blink/client'
import { ExecutionTimeline as TimelineType, ExecutionStep } from '../../types'

interface TimelineEvent {
  id: string
  timestamp: number
  type: 'breakpoint' | 'watch' | 'condition' | 'log' | 'assertion' | 'memory' | 'performance'
  nodeId: string
  action: string
  data: any
  duration?: number
  status: 'pending' | 'active' | 'completed' | 'error'
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'breakpoint': return AlertTriangle
    case 'watch': return Eye
    case 'condition': return Zap
    case 'log': return FileText
    case 'assertion': return CheckCircle
    case 'memory': return MemoryStick
    case 'performance': return Activity
    default: return Clock
  }
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'breakpoint': return 'bg-red-500'
    case 'watch': return 'bg-blue-500'
    case 'condition': return 'bg-yellow-500'
    case 'log': return 'bg-green-500'
    case 'assertion': return 'bg-purple-500'
    case 'memory': return 'bg-orange-500'
    case 'performance': return 'bg-pink-500'
    default: return 'bg-gray-500'
  }
}

export default function ExecutionTimeline() {
  const [timeline, setTimeline] = useState<TimelineType | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [annotations, setAnnotations] = useState<{ [key: number]: string }>({})
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock timeline data for demonstration
  useEffect(() => {
    const mockEvents: TimelineEvent[] = [
      {
        id: '1',
        timestamp: 0,
        type: 'breakpoint',
        nodeId: 'breakpoint-1',
        action: 'Hit breakpoint at line 42',
        data: { filePath: 'main.js', lineNumber: 42, variables: { x: 10, y: 20 } },
        duration: 500,
        status: 'completed'
      },
      {
        id: '2',
        timestamp: 1000,
        type: 'watch',
        nodeId: 'watch-1',
        action: 'Variable changed',
        data: { variable: 'counter', oldValue: 0, newValue: 1, type: 'number' },
        duration: 200,
        status: 'completed'
      },
      {
        id: '3',
        timestamp: 2500,
        type: 'condition',
        nodeId: 'condition-1',
        action: 'Condition evaluated',
        data: { expression: 'x > 5', result: true, context: { x: 10 } },
        duration: 100,
        status: 'completed'
      },
      {
        id: '4',
        timestamp: 4000,
        type: 'log',
        nodeId: 'log-1',
        action: 'Debug message logged',
        data: { message: 'Processing user input', level: 'info', context: {} },
        duration: 50,
        status: 'completed'
      },
      {
        id: '5',
        timestamp: 5500,
        type: 'memory',
        nodeId: 'memory-1',
        action: 'Memory snapshot taken',
        data: { heapUsed: 15.2, heapTotal: 32.0, external: 2.1, arrayBuffers: 0.5 },
        duration: 300,
        status: 'completed'
      },
      {
        id: '6',
        timestamp: 7000,
        type: 'assertion',
        nodeId: 'assertion-1',
        action: 'Assertion passed',
        data: { assertion: 'result !== null', result: true, actualValue: 'success' },
        duration: 150,
        status: 'completed'
      },
      {
        id: '7',
        timestamp: 8500,
        type: 'performance',
        nodeId: 'performance-1',
        action: 'Performance metrics collected',
        data: { cpuUsage: 45.2, executionTime: 125, functionCalls: 23 },
        duration: 200,
        status: 'completed'
      }
    ]

    setEvents(mockEvents)
    setTimeline({
      id: 'timeline-1',
      workflowId: 'workflow-1',
      userId: 'user-1',
      executionData: mockEvents as ExecutionStep[],
      durationMs: 10000,
      status: 'completed',
      createdAt: new Date().toISOString()
    })
  }, [])

  const totalDuration = timeline?.durationMs || 10000

  const play = useCallback(() => {
    if (isPlaying) return
    
    setIsPlaying(true)
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + (100 * playbackSpeed)
        if (next >= totalDuration) {
          setIsPlaying(false)
          return totalDuration
        }
        return next
      })
    }, 100)
  }, [isPlaying, playbackSpeed, totalDuration])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    pause()
    setCurrentTime(0)
  }, [pause])

  const seekTo = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)))
  }, [totalDuration])

  const addBookmark = useCallback(() => {
    if (!bookmarks.includes(currentTime)) {
      setBookmarks(prev => [...prev, currentTime].sort((a, b) => a - b))
    }
  }, [currentTime, bookmarks])

  const addAnnotation = useCallback((time: number, text: string) => {
    setAnnotations(prev => ({ ...prev, [time]: text }))
  }, [])

  const getCurrentEvents = useCallback(() => {
    return events.filter(event => 
      event.timestamp <= currentTime && 
      event.timestamp + (event.duration || 0) >= currentTime
    )
  }, [events, currentTime])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const milliseconds = ms % 1000
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const currentEvents = getCurrentEvents()

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Timeline Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Execution Timeline</h2>
            <p className="text-slate-400 text-sm">
              {timeline ? `Duration: ${formatTime(timeline.durationMs)} • ${events.length} events` : 'No timeline loaded'}
            </p>
          </div>
          
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button onClick={stop} size="sm" variant="outline">
              <Square className="w-4 h-4" />
            </Button>
            <Button onClick={isPlaying ? pause : play} size="sm">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button onClick={() => seekTo(currentTime - 1000)} size="sm" variant="outline">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button onClick={() => seekTo(currentTime + 1000)} size="sm" variant="outline">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button onClick={addBookmark} size="sm" variant="outline">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm min-w-[60px]">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[currentTime]}
                onValueChange={([value]) => seekTo(value)}
                max={totalDuration}
                step={100}
                className="w-full"
              />
              
              {/* Event Markers */}
              <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                {events.map(event => (
                  <div
                    key={event.id}
                    className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                    style={{ left: `${(event.timestamp / totalDuration) * 100}%` }}
                  />
                ))}
                
                {/* Bookmarks */}
                {bookmarks.map(bookmark => (
                  <div
                    key={bookmark}
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-400"
                    style={{ left: `${(bookmark / totalDuration) * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <span className="text-slate-400 text-sm min-w-[60px]">
              {formatTime(totalDuration)}
            </span>
          </div>
          
          {/* Playback Speed */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-slate-400 text-sm">Speed:</span>
            {[0.25, 0.5, 1, 2, 4].map(speed => (
              <Button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                size="sm"
                variant={playbackSpeed === speed ? "default" : "outline"}
                className="text-xs"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Timeline Events */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {events.map(event => {
              const Icon = getEventIcon(event.type)
              const isActive = currentEvents.includes(event)
              const isPast = event.timestamp + (event.duration || 0) < currentTime
              
              return (
                <Card
                  key={event.id}
                  className={`cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-slate-700 border-blue-500 shadow-lg' 
                      : isPast 
                        ? 'bg-slate-800 border-slate-600 opacity-60'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium">{event.action}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {formatTime(event.timestamp)}
                            </Badge>
                            {event.duration && (
                              <Badge variant="outline" className="text-xs">
                                {event.duration}ms
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-400 text-sm mt-1">
                          Node: {event.nodeId}
                        </p>
                        
                        {/* Event-specific data preview */}
                        <div className="mt-2 text-xs text-slate-300">
                          {event.type === 'breakpoint' && (
                            <span>{event.data.filePath}:{event.data.lineNumber}</span>
                          )}
                          {event.type === 'watch' && (
                            <span>{event.data.variable}: {event.data.oldValue} → {event.data.newValue}</span>
                          )}
                          {event.type === 'condition' && (
                            <span>{event.data.expression} = {event.data.result.toString()}</span>
                          )}
                          {event.type === 'log' && (
                            <span>{event.data.message}</span>
                          )}
                          {event.type === 'memory' && (
                            <span>Heap: {event.data.heapUsed}MB / {event.data.heapTotal}MB</span>
                          )}
                          {event.type === 'assertion' && (
                            <span>{event.data.assertion} → {event.data.result ? 'PASS' : 'FAIL'}</span>
                          )}
                          {event.type === 'performance' && (
                            <span>CPU: {event.data.cpuUsage}% • Time: {event.data.executionTime}ms</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Event Details Panel */}
        <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto">
          {selectedEvent ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {React.createElement(getEventIcon(selectedEvent.type), { 
                  className: `w-5 h-5 text-white p-1 rounded ${getEventColor(selectedEvent.type)}` 
                })}
                <h3 className="text-white font-medium">{selectedEvent.action}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm">Timestamp</label>
                  <p className="text-white">{formatTime(selectedEvent.timestamp)}</p>
                </div>
                
                <div>
                  <label className="text-slate-400 text-sm">Duration</label>
                  <p className="text-white">{selectedEvent.duration || 0}ms</p>
                </div>
                
                <div>
                  <label className="text-slate-400 text-sm">Node ID</label>
                  <p className="text-white font-mono text-sm">{selectedEvent.nodeId}</p>
                </div>
                
                <div>
                  <label className="text-slate-400 text-sm">Status</label>
                  <Badge className={
                    selectedEvent.status === 'completed' ? 'bg-green-500' :
                    selectedEvent.status === 'error' ? 'bg-red-500' :
                    selectedEvent.status === 'active' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }>
                    {selectedEvent.status}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-slate-400 text-sm">Data</label>
                  <pre className="text-white text-xs bg-slate-800 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </pre>
                </div>
                
                {/* Add annotation */}
                <div>
                  <label className="text-slate-400 text-sm">Add Note</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add annotation..."
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          addAnnotation(selectedEvent.timestamp, input.value)
                          input.value = ''
                        }
                      }}
                    />
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                  {annotations[selectedEvent.timestamp] && (
                    <p className="text-slate-300 text-sm mt-2 p-2 bg-slate-800 rounded">
                      {annotations[selectedEvent.timestamp]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 mt-8">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select an event to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}