import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Video, 
  Users, 
  Play, 
  Pause, 
  Square, 
  Monitor, 
  Mic, 
  MicOff,
  Camera,
  CameraOff,
  MessageSquare,
  Settings,
  UserPlus,
  Clock,
  Circle,
  Share,
  Eye,
  Maximize
} from 'lucide-react';
import { blink } from '@/blink/client';
import type { LiveSession, SessionParticipant, User, CodeAnnotation } from '@/types';

export function LiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [annotations, setAnnotations] = useState<CodeAnnotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [sessionType, setSessionType] = useState<'debugging' | 'code_review' | 'planning'>('debugging');

  // Real-time collaboration state
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const user = await blink.auth.me();
      
      // Load all sessions for the user's team
      const allSessions = await blink.db.liveSessions.list({
        orderBy: { createdAt: 'desc' },
        limit: 20
      });
      setSessions(allSessions);

      // Load current active session if any
      const activeSessions = allSessions.filter(s => s.status === 'active');
      if (activeSessions.length > 0) {
        setCurrentSession(activeSessions[0]);
        
        // Load participants for current session
        const sessionParticipants = await blink.db.sessionParticipants.list({
          where: { sessionId: activeSessions[0].id, isActive: 1 }
        });
        setParticipants(sessionParticipants);

        // Load annotations for current session
        const sessionAnnotations = await blink.db.codeAnnotations.list({
          where: { sessionId: activeSessions[0].id },
          orderBy: { createdAt: 'desc' }
        });
        setAnnotations(sessionAnnotations);
      }

    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createSession = async () => {
    if (!newSessionTitle.trim()) return;
    
    try {
      const user = await blink.auth.me();
      const sessionId = `session_${Date.now()}`;
      
      const newSession = await blink.db.liveSessions.create({
        id: sessionId,
        teamId: 'team_default', // In real app, get from context
        title: newSessionTitle,
        description: newSessionDescription,
        hostId: user.id,
        status: 'active',
        sessionType,
        participants: JSON.stringify([user.id]),
        screenSharingActive: 0,
        recordingEnabled: 0
      });

      // Add host as participant
      await blink.db.sessionParticipants.create({
        id: `participant_${Date.now()}`,
        sessionId,
        userId: user.id,
        role: 'host',
        isActive: 1
      });

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setIsCreatingSession(false);
      setNewSessionTitle('');
      setNewSessionDescription('');
      
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const joinSession = async (session: LiveSession) => {
    try {
      const user = await blink.auth.me();
      
      // Add user as participant
      await blink.db.sessionParticipants.create({
        id: `participant_${Date.now()}`,
        sessionId: session.id,
        userId: user.id,
        role: 'participant',
        isActive: 1
      });

      // Update session participants
      const currentParticipants = JSON.parse(session.participants);
      if (!currentParticipants.includes(user.id)) {
        currentParticipants.push(user.id);
        await blink.db.liveSessions.update(session.id, {
          participants: JSON.stringify(currentParticipants)
        });
      }

      setCurrentSession(session);
      loadSessions(); // Refresh data
      
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      await blink.db.liveSessions.update(sessionId, {
        status: 'ended',
        endedAt: new Date().toISOString()
      });

      // Mark all participants as inactive
      await blink.db.sessionParticipants.list({
        where: { sessionId }
      }).then(participants => {
        participants.forEach(p => {
          blink.db.sessionParticipants.update(p.id, {
            isActive: 0,
            leftAt: new Date().toISOString()
          });
        });
      });

      setCurrentSession(null);
      loadSessions();
      
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // In real implementation, this would start/stop screen sharing
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In real implementation, this would start/stop recording
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'debugging': return 'bg-red-600';
      case 'code_review': return 'bg-blue-600';
      case 'planning': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'ended': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Sessions</h1>
          <p className="text-slate-400 mt-1">
            Real-time collaborative debugging sessions
          </p>
        </div>
        <Dialog open={isCreatingSession} onOpenChange={setIsCreatingSession}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Session</DialogTitle>
              <DialogDescription className="text-slate-400">
                Start a new collaborative debugging session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Session Title
                </label>
                <Input
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="Enter session title..."
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Description
                </label>
                <Textarea
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                  placeholder="Describe what you'll be debugging..."
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Session Type
                </label>
                <div className="flex gap-2">
                  {(['debugging', 'code_review', 'planning'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={sessionType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSessionType(type)}
                      className={sessionType === type ? "bg-blue-600" : "border-slate-600 text-slate-300"}
                    >
                      {type.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingSession(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button onClick={createSession} className="bg-blue-600 hover:bg-blue-700">
                  Create Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Active Session */}
      {currentSession && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  {currentSession.title}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {currentSession.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSessionTypeColor(currentSession.sessionType)}>
                  {currentSession.sessionType.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="border-green-500 text-green-400">
                  Live
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Session Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isMicOn ? "default" : "outline"}
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={isMicOn ? "bg-green-600" : "border-slate-600"}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={isCameraOn ? "default" : "outline"}
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={isCameraOn ? "bg-green-600" : "border-slate-600"}
                  >
                    {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={isScreenSharing ? "default" : "outline"}
                    onClick={toggleScreenShare}
                    className={isScreenSharing ? "bg-blue-600" : "border-slate-600"}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isRecording ? "default" : "outline"}
                    onClick={toggleRecording}
                    className={isRecording ? "bg-red-600" : "border-slate-600"}
                  >
                    <Circle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => endSession(currentSession.id)}
                >
                  <Square className="w-4 h-4 mr-2" />
                  End
                </Button>
              </div>
            </div>

            {/* Participants */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Participants ({participants.length})
              </h4>
              <div className="flex items-center gap-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.userId}`} />
                        <AvatarFallback className="bg-slate-700 text-white text-xs">
                          {participant.userId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-slate-800"></div>
                    </div>
                    <div className="text-xs">
                      <div className="text-white">User {participant.userId.slice(-4)}</div>
                      <div className="text-slate-400 capitalize">{participant.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Screen Sharing Area */}
            <div className="bg-slate-900 rounded-lg p-8 text-center">
              {isScreenSharing ? (
                <div className="space-y-4">
                  <Monitor className="w-16 h-16 mx-auto text-blue-400" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Screen Sharing Active</h3>
                    <p className="text-slate-400">Your screen is being shared with participants</p>
                  </div>
                  <Button onClick={toggleScreenShare} variant="outline" className="border-slate-600">
                    Stop Sharing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Eye className="w-16 h-16 mx-auto text-slate-500" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Ready to Share</h3>
                    <p className="text-slate-400">Click to start sharing your screen</p>
                  </div>
                  <Button onClick={toggleScreenShare} className="bg-blue-600 hover:bg-blue-700">
                    <Monitor className="w-4 h-4 mr-2" />
                    Start Screen Share
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Sessions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Sessions</CardTitle>
          <CardDescription className="text-slate-400">
            Recent and ongoing debugging sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sessions yet</p>
                <Button 
                  onClick={() => setIsCreatingSession(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Create First Session
                </Button>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${session.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <div>
                      <h4 className="font-medium text-white">{session.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {JSON.parse(session.participants).length} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.createdAt).toLocaleTimeString()}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`${getSessionTypeColor(session.sessionType)} text-white text-xs`}
                        >
                          {session.sessionType.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getSessionStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    {session.status === 'active' ? (
                      <Button 
                        size="sm" 
                        onClick={() => joinSession(session)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}