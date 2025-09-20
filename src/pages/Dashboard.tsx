import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  MessageCircle, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Heart,
  Building2,
  Crown,
  Star,
  TrendingUp,
  Shield,
  BarChart3,
  UserPlus,
  MessageSquare,
  Activity,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStats } from '@/hooks/useStats';
import { useCommunities } from '@/hooks/useCommunities';
import { useClubs } from '@/hooks/useClubs';
import { useMentorship } from '@/hooks/useMentorship';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { authHelpers } from '@/lib/supabase';
import Communities from './Communities';
import Profile from './Profile';
import ChatRoom from './ChatRoom';
import AdminPanel from './AdminPanel';

interface DashboardProps {
  onLogout: () => void;
  onOpenClubPosts: (clubId: string, clubName: string) => void;
}

type ActiveView = 'dashboard' | 'communities' | 'profile' | 'chat' | 'admin' | 'mentors' | 'collaboration';

const Dashboard = ({ onLogout, onOpenClubPosts }: DashboardProps) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useStats();
  const { communities, loading: communitiesLoading } = useCommunities();
  const { clubs, loading: clubsLoading } = useClubs();
  const { mentorships, loading: mentorshipsLoading } = useMentorship();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get user profile from users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setUser(profile || {
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: user.user_metadata?.role || 'junior',
            profile_pic: user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            college: '',
            stream: ''
          });
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    onLogout();
    return null;
  }

  const handleLogout = async () => {
    try {
      await authHelpers.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  const handleOpenChat = (roomId: string) => {
    setSelectedChatRoom(roomId);
    setActiveView('chat');
  };

  const renderNavigation = () => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-blue-200">
            <AvatarImage src={user.profile_pic} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg text-slate-800">{user.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={user.role === 'admin' ? 'destructive' : user.role === 'mentor' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                {user.role === 'mentor' && <Star className="w-3 h-3 mr-1" />}
                {user.role}
              </Badge>
              {user.role === 'mentor' && user.available_for_mentorship && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  Available for Mentorship
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={activeView === 'dashboard' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-blue-50"
          onClick={() => setActiveView('dashboard')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant={activeView === 'communities' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-blue-50"
          onClick={() => setActiveView('communities')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Communities
        </Button>
        <Button
          variant={activeView === 'mentors' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-blue-50"
          onClick={() => setActiveView('mentors')}
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          Mentors
        </Button>
        <Button
          variant={activeView === 'collaboration' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-blue-50"
          onClick={() => setActiveView('collaboration')}
        >
          <Users className="w-4 h-4 mr-2" />
          Collaboration
        </Button>
        <Button
          variant={activeView === 'profile' ? 'default' : 'ghost'}
          className="w-full justify-start transition-all duration-200 hover:bg-blue-50"
          onClick={() => setActiveView('profile')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Profile
        </Button>
        {user.role === 'admin' && (
          <Button
            variant={activeView === 'admin' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-200 hover:bg-blue-50"
            onClick={() => setActiveView('admin')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        )}
        <div className="pt-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStatsCard = (title: string, value: number, icon: React.ReactNode, color: string, loading: boolean) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-2" />
        ) : (
          <div className="text-3xl font-bold text-slate-800 mb-2">{value}</div>
        )}
        <p className="text-xs text-slate-500">
          Real-time data from Supabase
        </p>
      </CardContent>
    </Card>
  );

  const renderDashboardOverview = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome back to U-Fresher
        </h1>
        <Heart className="w-8 h-8 text-pink-500" />
      </div>

      {/* Real Stats from Supabase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatsCard(
          "Communities Joined",
          stats.communities_joined,
          <Building2 className="h-5 w-5 text-blue-600" />,
          "bg-blue-100",
          statsLoading
        )}
        {renderStatsCard(
          "Active Clubs",
          stats.active_clubs,
          <Users className="h-5 w-5 text-green-600" />,
          "bg-green-100",
          statsLoading
        )}
        {renderStatsCard(
          "Total Mentors",
          stats.mentors,
          <GraduationCap className="h-5 w-5 text-purple-600" />,
          "bg-purple-100",
          statsLoading
        )}
        {renderStatsCard(
          "Active Connections",
          stats.active_connections,
          <UserPlus className="h-5 w-5 text-orange-600" />,
          "bg-orange-100",
          statsLoading
        )}
      </div>

      {/* Recent Communities */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Your Communities</CardTitle>
          <CardDescription className="text-slate-600">Communities you're part of</CardDescription>
        </CardHeader>
        <CardContent>
          {communitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : communities.length > 0 ? (
            <div className="space-y-4">
              {communities.slice(0, 3).map((community) => (
                <div key={community.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {community.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{community.name}</p>
                      <p className="text-sm text-slate-600">{community.college_name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {community.member_count || 0} members
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">You haven't joined any communities yet</p>
              <Button 
                onClick={() => setActiveView('communities')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                Explore Communities
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Quick Actions</CardTitle>
          <CardDescription className="text-slate-600">Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => setActiveView('communities')}
              className="h-auto p-6 flex-col gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-200 transform hover:scale-105"
            >
              <Building2 className="w-8 h-8" />
              <span className="font-semibold">Explore Communities</span>
              <span className="text-sm opacity-90">Join your college community</span>
            </Button>
            <Button 
              onClick={() => setActiveView('mentors')}
              variant="outline"
              className="h-auto p-6 flex-col gap-3 border-2 border-green-200 hover:bg-green-50 transition-all duration-200 transform hover:scale-105"
            >
              <GraduationCap className="w-8 h-8 text-green-600" />
              <span className="font-semibold text-green-700">Find Mentors</span>
              <span className="text-sm text-green-600">Connect with experienced mentors</span>
            </Button>
            <Button 
              onClick={() => setActiveView('profile')}
              variant="outline"
              className="h-auto p-6 flex-col gap-3 border-2 border-purple-200 hover:bg-purple-50 transition-all duration-200 transform hover:scale-105"
            >
              <Settings className="w-8 h-8 text-purple-600" />
              <span className="font-semibold text-purple-700">Update Profile</span>
              <span className="text-sm text-purple-600">Manage your information</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'communities':
        return <Communities onOpenChat={handleOpenChat} onOpenClubPosts={onOpenClubPosts} />;
      case 'profile':
        return <Profile />;
      case 'chat':
        return selectedChatRoom ? (
          <ChatRoom 
            roomId={selectedChatRoom} 
            onBack={() => setActiveView('communities')} 
          />
        ) : null;
      case 'admin':
        return user.role === 'admin' ? <AdminPanel /> : renderDashboardOverview();
      case 'mentors':
        return <MentorsView />;
      case 'collaboration':
        return <CollaborationView />;
      default:
        return renderDashboardOverview();
    }
  };

  const MentorsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Mentors & Mentorship
        </h1>
        <GraduationCap className="w-8 h-8 text-green-600" />
      </div>
      
      {/* Mentor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Available Mentors</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">12</div>
            <p className="text-xs text-slate-500">Active mentors ready to help</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Mentorships</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">8</div>
            <p className="text-xs text-slate-500">Ongoing mentorship relationships</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
            <Star className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">95%</div>
            <p className="text-xs text-slate-500">Student satisfaction rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              Academic Mentors
            </CardTitle>
            <CardDescription className="text-slate-600">
              Get help with studies and coursework
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Connect with experienced students and alumni who can guide you through your academic journey.
            </p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              Find Academic Mentor
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Career Mentors
            </CardTitle>
            <CardDescription className="text-slate-600">
              Professional guidance and career advice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Get career advice from industry professionals and alumni working in your field of interest.
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
              Find Career Mentor
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              Project Mentors
            </CardTitle>
            <CardDescription className="text-slate-600">
              Guidance for projects and research
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Work with mentors who can help you with specific projects, research, and technical challenges.
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Find Project Mentor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Mentors */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Featured Mentors</CardTitle>
          <CardDescription className="text-slate-600">Top-rated mentors in our community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GraduationCap className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Mentorship Platform Coming Soon</h3>
            <p className="text-slate-600 mb-6">We're building an amazing mentorship platform with advanced matching and communication features</p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                Get Notified
              </Button>
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CollaborationView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Project Collaboration
        </h1>
        <Users className="w-8 h-8 text-purple-600" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Find Collaborators
            </CardTitle>
            <CardDescription className="text-slate-600">
              Discover students working on similar projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Connect with fellow students who share your interests and skills for collaborative projects.
            </p>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Browse Projects
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Start a Project
            </CardTitle>
            <CardDescription className="text-slate-600">
              Create and share your project ideas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Post your project ideas and invite others to join your team for collaborative work.
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
              Create Project
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10 rounded-2xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Skill Matching
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find team members with specific skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Match with students who have the skills you need for your project or offer your expertise.
            </p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              Match Skills
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Active Projects</CardTitle>
          <CardDescription className="text-slate-600">Projects currently looking for collaborators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Collaboration Platform Coming Soon</h3>
            <p className="text-slate-600 mb-6">We're building an amazing project collaboration platform for you</p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Get Notified
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {renderNavigation()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;