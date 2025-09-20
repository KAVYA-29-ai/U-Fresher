import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Building, 
  Users, 
  MessageCircle, 
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCommunities } from '@/hooks/useCommunities';
import { useClubs } from '@/hooks/useClubs';
import { supabase } from '@/lib/supabase';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', college_name: '' });
  const [newClub, setNewClub] = useState({ name: '', description: '', communityId: '' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCommunities: 0,
    totalClubs: 0,
    flaggedContent: 0
  });
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { communities, loading: communitiesLoading } = useCommunities();
  const { clubs, loading: clubsLoading } = useClubs();
  const { toast } = useToast();

  // Fetch admin stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get total users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        // Get total communities
        const { count: communityCount } = await supabase
          .from('communities')
          .select('*', { count: 'exact', head: true });
        
        // Get total clubs
        const { count: clubCount } = await supabase
          .from('clubs')
          .select('*', { count: 'exact', head: true });
        
        // Get flagged content count
        const { count: flaggedCount } = await supabase
          .from('moderation_logs')
          .select('*', { count: 'exact', head: true })
          .eq('moderator_action', 'pending');
        
        setStats({
          totalUsers: userCount || 0,
          totalCommunities: communityCount || 0,
          totalClubs: clubCount || 0,
          flaggedContent: flaggedCount || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have admin privileges to access this panel.</p>
        </CardContent>
      </Card>
    );
  }

  const createCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.college_name.trim()) {
      toast({
        title: "Error",
        description: "Community name and college name are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('communities')
        .insert({
          name: newCommunity.name,
          description: newCommunity.description,
          college_name: newCommunity.college_name,
          created_by: user?.id
        });

      if (error) {
        throw error;
      }

      setNewCommunity({ name: '', description: '', college_name: '' });
      toast({
        title: "Community Created!",
        description: `${newCommunity.name} has been successfully created`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create community",
        variant: "destructive"
      });
    }
  };

  const createClub = async () => {
    if (!newClub.name.trim() || !newClub.communityId) {
      toast({
        title: "Error",
        description: "Club name and community selection are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clubs')
        .insert({
          name: newClub.name,
          description: newClub.description,
          community_id: newClub.communityId,
          club_head: user?.name,
          created_by: user?.id
        });

      if (error) {
        throw error;
      }

      setNewClub({ name: '', description: '', communityId: '' });
      toast({
        title: "Club Created!",
        description: `${newClub.name} has been successfully created`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      });
    }
  };

  const deleteCommunity = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) {
        throw error;
      }

      toast({
        title: "Community Deleted",
        description: "Community has been removed",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete community",
        variant: "destructive"
      });
    }
  };

  const deleteClub = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId);

      if (error) {
        throw error;
      }

      toast({
        title: "Club Deleted",
        description: "Club has been removed",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete club",
        variant: "destructive"
      });
    }
  };

  // Mock flagged content
  const flaggedContent = [
    {
      id: '1',
      type: 'message',
      content: 'This is a flagged message that contains inappropriate content',
      author: 'John Doe',
      flaggedReason: 'Inappropriate language detected by AI',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'message',
      content: 'Another message that was flagged for spam',
      author: 'Jane Smith',
      flaggedReason: 'Potential spam content',
      timestamp: '4 hours ago'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? '...' : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {loading ? '...' : stats.totalCommunities}
            </div>
            <p className="text-xs text-muted-foreground">Active communities</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {loading ? '...' : stats.totalClubs}
            </div>
            <p className="text-xs text-muted-foreground">Across all communities</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loading ? '...' : stats.flaggedContent}
            </div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <CardDescription>Key metrics and system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span>AI Moderation System</span>
              </div>
              <Badge variant="default" className="bg-success">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span>Real-time Messaging</span>
              </div>
              <Badge variant="default" className="bg-success">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                <span>User Authentication</span>
              </div>
              <Badge variant="default" className="bg-success">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunityManagement = () => (
    <div className="space-y-6">
      {/* Create Community */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Create New Community</CardTitle>
          <CardDescription>Add a new college or organization community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="community-name">Community Name</Label>
              <Input
                id="community-name"
                placeholder="e.g., MIT University"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-name">College Name</Label>
              <Input
                id="college-name"
                placeholder="e.g., Massachusetts Institute of Technology"
                value={newCommunity.college_name}
                onChange={(e) => setNewCommunity({...newCommunity, college_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community-desc">Description</Label>
              <Textarea
                id="community-desc"
                placeholder="Brief description of the community"
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={createCommunity} className="btn-cosmic">
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        </CardContent>
      </Card>

      {/* Existing Communities */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Manage Communities</CardTitle>
          <CardDescription>View and manage existing communities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communitiesLoading ? (
              <div className="text-center py-4">Loading communities...</div>
            ) : communities.length > 0 ? (
              communities.map((community) => (
                <div key={community.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium">{community.name}</h4>
                    <p className="text-sm text-muted-foreground">{community.college_name}</p>
                    {community.description && (
                      <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
                    )}
                    <Badge variant="secondary" className="text-xs mt-2">
                      {community.member_count || 0} members
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCommunity(community.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">No communities found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClubManagement = () => (
    <div className="space-y-6">
      {/* Create Club */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Create New Club</CardTitle>
          <CardDescription>Add a new club to a community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="club-name">Club Name</Label>
              <Input
                id="club-name"
                placeholder="e.g., AI Research Group"
                value={newClub.name}
                onChange={(e) => setNewClub({...newClub, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="club-community">Community</Label>
              <select
                id="club-community"
                className="w-full p-2 border border-border rounded-md bg-background"
                value={newClub.communityId}
                onChange={(e) => setNewClub({...newClub, communityId: e.target.value})}
              >
                <option value="">Select Community</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name} - {community.college_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="club-desc">Description</Label>
              <Textarea
                id="club-desc"
                placeholder="Club description"
                value={newClub.description}
                onChange={(e) => setNewClub({...newClub, description: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={createClub} className="btn-cosmic">
            <Plus className="w-4 h-4 mr-2" />
            Create Club
          </Button>
        </CardContent>
      </Card>

      {/* Existing Clubs */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Manage Clubs</CardTitle>
          <CardDescription>View and manage existing clubs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clubsLoading ? (
              <div className="text-center py-4">Loading clubs...</div>
            ) : clubs.length > 0 ? (
              clubs.map((club) => {
                const community = communities.find(c => c.id === club.community_id);
                return (
                  <div key={club.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">{club.name}</h4>
                      <p className="text-sm text-muted-foreground">{club.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {community?.name || 'Unknown Community'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {club.member_count || 0} members
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteClub(club.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">No clubs found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      {/* Moderation Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Moderation Settings</CardTitle>
          <CardDescription>Configure AI moderation and safety features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="moderation-toggle">AI Content Moderation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically flag inappropriate content using Gemini AI
              </p>
            </div>
            <Switch
              id="moderation-toggle"
              checked={moderationEnabled}
              onCheckedChange={setModerationEnabled}
            />
          </div>
          {!moderationEnabled && (
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Warning: AI Moderation Disabled</span>
              </div>
              <p className="text-sm text-destructive/80 mt-1">
                Disabling AI moderation may allow inappropriate content to be posted.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flagged Content */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Flagged Content Review</CardTitle>
          <CardDescription>Review and moderate flagged content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flaggedContent.map((item) => (
              <div key={item.id} className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="destructive" className="text-xs mb-2">
                      {item.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      By {item.author} • {item.timestamp}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3 p-3 bg-muted/50 rounded border-l-4 border-l-destructive">
                  <p className="text-sm">{item.content}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-destructive">
                    AI Flagged: {item.flaggedReason}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="bg-success hover:bg-success/80">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {flaggedContent.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No flagged content to review</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="communities">
            <Building className="w-4 h-4 mr-2" />
            Communities
          </TabsTrigger>
          <TabsTrigger value="clubs">
            <Users className="w-4 h-4 mr-2" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <Shield className="w-4 h-4 mr-2" />
            Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="communities">
          {renderCommunityManagement()}
        </TabsContent>

        <TabsContent value="clubs">
          {renderClubManagement()}
        </TabsContent>

        <TabsContent value="moderation">
          {renderModeration()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
