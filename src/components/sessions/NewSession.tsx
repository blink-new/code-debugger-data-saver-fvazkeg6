import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Code, 
  AlertTriangle,
  Plus,
  X,
  Save
} from 'lucide-react'
import { blink } from '@/blink/client'
import { toast } from 'sonner'

interface NewSessionProps {
  onNavigate: (tab: string) => void
}

export function NewSession({ onNavigate }: NewSessionProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [duration, setDuration] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && duration < 30) {
      interval = setInterval(() => {
        setDuration(prev => {
          if (prev >= 29) {
            setIsRunning(false)
            toast.warning('Session automatically stopped at 30 seconds limit')
            return 30
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, duration])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const startSession = async () => {
    if (!title.trim()) {
      toast.error('Please enter a session title')
      return
    }

    try {
      const user = await blink.auth.me()
      const newSessionId = `session_${Date.now()}`
      
      await blink.db.debugSessions.create({
        id: newSessionId,
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        duration: 0,
        status: 'active',
        tags: JSON.stringify(tags)
      })

      setSessionId(newSessionId)
      setIsRunning(true)
      setDuration(0)
      toast.success('Debug session started!')
    } catch (error) {
      console.error('Failed to start session:', error)
      toast.error('Failed to start session')
    }
  }

  const pauseSession = () => {
    setIsRunning(false)
    toast.info('Session paused')
  }

  const resumeSession = () => {
    if (duration < 30) {
      setIsRunning(true)
      toast.info('Session resumed')
    }
  }

  const stopSession = async () => {
    if (!sessionId) return

    try {
      await blink.db.debugSessions.update(sessionId, {
        duration,
        status: 'completed',
        updatedAt: new Date().toISOString()
      })

      setIsRunning(false)
      toast.success('Session completed!')
      
      // Navigate to sessions view
      setTimeout(() => {
        onNavigate('sessions')
      }, 1500)
    } catch (error) {
      console.error('Failed to stop session:', error)
      toast.error('Failed to stop session')
    }
  }

  const saveSession = async () => {
    if (!sessionId) return

    setSaving(true)
    try {
      await blink.db.debugSessions.update(sessionId, {
        title: title.trim(),
        description: description.trim(),
        tags: JSON.stringify(tags),
        duration,
        updatedAt: new Date().toISOString()
      })

      toast.success('Session saved!')
    } catch (error) {
      console.error('Failed to save session:', error)
      toast.error('Failed to save session')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (duration / 30) * 100

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Debug Session</h1>
          <p className="text-gray-600 mt-1">Create and manage your debugging session (max 30 seconds)</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onNavigate('sessions')}
        >
          Back to Sessions
        </Button>
      </div>

      {/* Session Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Session Title *
            </label>
            <Input
              placeholder="e.g., API Authentication Bug"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description
            </label>
            <Textarea
              placeholder="Describe what you're debugging..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isRunning}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                disabled={isRunning}
              />
              <Button 
                variant="outline" 
                onClick={addTag}
                disabled={isRunning}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Session Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
              {formatTime(duration)}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {30 - duration} seconds remaining
            </div>
            <Progress value={progressPercentage} className="w-full max-w-md mx-auto" />
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!sessionId ? (
              <Button 
                onClick={startSession}
                className="bg-green-600 hover:bg-green-700"
                disabled={!title.trim()}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button 
                    onClick={pauseSession}
                    variant="outline"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    onClick={resumeSession}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={duration >= 30}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                )}
                
                <Button 
                  onClick={saveSession}
                  variant="outline"
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>

                <Button 
                  onClick={stopSession}
                  variant="destructive"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop & Complete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {sessionId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Code className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Add Code Snippet</h3>
              <p className="text-sm text-gray-600">Save problematic code (max 3)</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-600 mb-2" />
              <h3 className="font-medium">Log Error</h3>
              <p className="text-sm text-gray-600">Record error messages</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Plus className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium">Add Note</h3>
              <p className="text-sm text-gray-600">Quick observations</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}