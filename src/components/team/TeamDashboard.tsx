import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Video, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Play,
  UserPlus,
  Settings,
  BarChart3,
  Calendar
} from 'lucide-react';
import { blink } from '@/blink/client';
import type { Team, LiveSession, TeamMember, PerformanceAnalytics, UserStatus } from '@/types';

export function TeamDashboard() {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeamData = useCallback(async () => {
    try {
      const user = await blink.auth.me();
      
      // Load current team (for demo, we'll create one if none exists)
      let teams = await blink.db.teams.list({
        where: { ownerId: user.id },
        limit: 1
      });

      if (teams.length === 0) {
        // Create a demo team
        const newTeam = await blink.db.teams.create({
          id: `team_${Date.now()}`,
          name: 'Development Team',
          description: 'Main development team for collaborative debugging',
          ownerId: user.id,
          settings: JSON.stringify({
            allowScreenSharing: true,
            requireApprovalForJoin: false,
            defaultSessionRecording: true,
            maxConcurrentSessions: 5
          })
        });
        teams = [newTeam];
      }

      setCurrentTeam(teams[0]);

      // Load live sessions
      const sessions = await blink.db.liveSessions.list({
        where: { teamId: teams[0].id, status: 'active' },
        orderBy: { createdAt: 'desc' },
        limit: 10
      });
      setLiveSessions(sessions);

      // Load team members
      const members = await blink.db.teamMembers.list({
        where: { teamId: teams[0].id, status: 'active' },
        orderBy: { joinedAt: 'desc' }
      });
      setTeamMembers(members);

      // Load user statuses
      const statuses = await blink.db.userStatus.list({
        limit: 20
      });
      setUserStatuses(statuses);

      // Generate mock analytics data
      setAnalytics({
        totalSessions: sessions.length + 15,
        averageSessionDuration: 45.5,
        bugsResolved: 23,
        averageResponseTime: 12.3,
        teamProductivity: 87,
        topPerformers: members.slice(0, 3),
        trendData: [
          { date: '2024-01-15', value: 12, metric: 'sessions' },
          { date: '2024-01-16', value: 18, metric: 'sessions' },
          { date: '2024-01-17', value: 15, metric: 'sessions' },
          { date: '2024-01-18', value: 22, metric: 'sessions' },
          { date: '2024-01-19', value: 19, metric: 'sessions' }
        ]
      });

    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const createNewSession = async () => {
    if (!currentTeam) return;
    
    try {
      const user = await blink.auth.me();
      const newSession = await blink.db.liveSessions.create({
        id: `session_${Date.now()}`,
        teamId: currentTeam.id,
        title: `Debug Session - ${new Date().toLocaleTimeString()}`,
        description: 'New collaborative debugging session',
        hostId: user.id,
        status: 'active',
        sessionType: 'debugging',
        participants: JSON.stringify([user.id]),
        screenSharingActive: 0,
        recordingEnabled: 1
      });
      
      setLiveSessions(prev => [newSession, ...prev]);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
      default: return 'Offline';
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
          <h1 className="text-3xl font-bold text-white">Team Dashboard</h1>
          <p className="text-slate-400 mt-1">
            {currentTeam?.name} • {teamMembers.length} members
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={createNewSession} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Start Session
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Sessions</CardTitle>
            <Video className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{liveSessions.length}</div>
            <p className="text-xs text-slate-400">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Team Members</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{teamMembers.length}</div>
            <p className="text-xs text-slate-400">
              {userStatuses.filter(s => s.status === 'available').length} available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.averageSessionDuration}m</div>
            <p className="text-xs text-slate-400">
              +5.2m from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Bugs Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.bugsResolved}</div>
            <p className="text-xs text-slate-400">
              87% resolution rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" />
              Active Sessions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Currently running debugging sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active sessions</p>
                <Button 
                  onClick={createNewSession}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Start First Session
                </Button>
              </div>
            ) : (
              liveSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <h4 className="font-medium text-white">{session.title}</h4>
                      <p className="text-sm text-slate-400">
                        {JSON.parse(session.participants).length} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      {session.sessionType}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                      Join
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Team Members
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current team status and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No team members yet</p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </Button>
              </div>
            ) : (
              teamMembers.map((member) => {
                const userStatus = userStatuses.find(s => s.userId === member.userId);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} />
                          <AvatarFallback className="bg-slate-700 text-white">
                            {member.userId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(userStatus?.status || 'offline')}`}></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">User {member.userId.slice(-4)}</h4>
                        <p className="text-sm text-slate-400 capitalize">{member.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(userStatus?.status || 'offline')} text-white`}
                      >
                        {getStatusText(userStatus?.status || 'offline')}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Team Performance
          </CardTitle>
          <CardDescription className="text-slate-400">
            Overall team productivity and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Team Productivity</span>
                <span className="text-white">{analytics?.teamProductivity}%</span>
              </div>
              <Progress value={analytics?.teamProductivity} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Response Time</span>
                <span className="text-white">{analytics?.averageResponseTime}m</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Resolution Rate</span>
                <span className="text-white">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="h-16 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3">
          <Play className="w-6 h-6" />
          <div className="text-left">
            <div className="font-medium">Start Debug Session</div>
            <div className="text-sm opacity-90">Begin collaborative debugging</div>
          </div>
        </Button>
        
        <Button variant="outline" className="h-16 border-slate-600 text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-3">
          <BarChart3 className="w-6 h-6" />
          <div className="text-left">
            <div className="font-medium">View Analytics</div>
            <div className="text-sm opacity-70">Team performance insights</div>
          </div>
        </Button>
        
        <Button variant="outline" className="h-16 border-slate-600 text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-3">
          <Calendar className="w-6 h-6" />
          <div className="text-left">
            <div className="font-medium">Schedule Session</div>
            <div className="text-sm opacity-70">Plan future debugging</div>
          </div>
        </Button>
      </div>
    </div>
  );
}