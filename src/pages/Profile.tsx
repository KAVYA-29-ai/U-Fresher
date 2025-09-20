import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Edit, 
  Save, 
  Building, 
  GraduationCap, 
  Users,
  Star,
  Crown,
  Heart
} from 'lucide-react';
import { getCurrentUser, profilePics, mockCommunities, mockClubs } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const user = getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    age: user?.age || 18,
    college: user?.college || '',
    stream: user?.stream || '',
    profilePic: user?.profilePic || profilePics[0],
    availableForMentorship: user?.availableForMentorship || false
  });
  const { toast } = useToast();

  if (!user) return null;

  const handleSave = () => {
    // Update user data
    user.name = editForm.name;
    user.age = editForm.age;
    user.college = editForm.college;
    user.stream = editForm.stream;
    user.profilePic = editForm.profilePic;
    if (user.role === 'mentor') {
      user.availableForMentorship = editForm.availableForMentorship;
    }

    setIsEditing(false);
    toast({
      title: "Profile Updated!",
      description: "Your profile has been successfully updated",
    });
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      age: user.age,
      college: user.college,
      stream: user.stream,
      profilePic: user.profilePic,
      availableForMentorship: user.availableForMentorship || false
    });
    setIsEditing(false);
  };

  const joinedCommunities = mockCommunities.filter(c => user.joinedCommunities.includes(c.id));
  const joinedClubs = mockClubs.filter(c => user.joinedClubs.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
        <Heart className="w-8 h-8 text-accent" />
      </div>

      {/* Profile Card */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="btn-cosmic">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="space-y-4">
              <Avatar className="w-24 h-24 avatar-glow">
                <AvatarImage src={isEditing ? editForm.profilePic : user.profilePic} alt={user.name} />
                <AvatarFallback className="text-xl">
                  {(isEditing ? editForm.name : user.name).slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="space-y-2">
                  <Label className="text-sm">Choose Avatar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {profilePics.map((pic, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${
                          editForm.profilePic === pic 
                            ? 'border-primary scale-110' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => setEditForm({...editForm, profilePic: pic})}
                      >
                        <img src={pic} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role and Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={user.role === 'admin' ? 'destructive' : user.role === 'mentor' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {user.role === 'admin' && <Crown className="w-4 h-4 mr-1" />}
                  {user.role === 'mentor' && <Star className="w-4 h-4 mr-1" />}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                {user.role === 'mentor' && (isEditing ? editForm.availableForMentorship : user.availableForMentorship) && (
                  <Badge variant="outline" className="text-success">
                    Available for Mentorship
                  </Badge>
                )}
              </div>
              
              {user.role === 'mentor' && isEditing && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mentorship-toggle"
                    checked={editForm.availableForMentorship}
                    onCheckedChange={(checked) => 
                      setEditForm({...editForm, availableForMentorship: checked})
                    }
                  />
                  <Label htmlFor="mentorship-toggle" className="text-sm">
                    Available for Mentorship
                  </Label>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Member since: January 2024</p>
                <p>Email: {user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded border">{user.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              {isEditing ? (
                <Input
                  id="age"
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded border">{user.age}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              {isEditing ? (
                <Input
                  id="college"
                  value={editForm.college}
                  onChange={(e) => setEditForm({...editForm, college: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded border">{user.college}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream">Stream</Label>
              {isEditing ? (
                <Input
                  id="stream"
                  value={editForm.stream}
                  onChange={(e) => setEditForm({...editForm, stream: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-muted/50 rounded border">{user.stream}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{joinedCommunities.length}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{joinedClubs.length}</div>
            <p className="text-xs text-muted-foreground">Club memberships</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'mentor' ? 'Mentees' : 'Mentors'}
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{user.connectedMentors.length}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Joined Communities */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>My Communities</CardTitle>
          <CardDescription>Communities you're part of</CardDescription>
        </CardHeader>
        <CardContent>
          {joinedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedCommunities.map((community) => (
                <div key={community.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="p-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{community.name}</h4>
                    <p className="text-sm text-muted-foreground">{community.memberCount} members</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't joined any communities yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Joined Clubs */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>My Clubs</CardTitle>
          <CardDescription>Clubs you're active in</CardDescription>
        </CardHeader>
        <CardContent>
          {joinedClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedClubs.map((club) => (
                <div key={club.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="p-2 rounded-full bg-gradient-to-r from-secondary to-accent text-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{club.name}</h4>
                    <p className="text-sm text-muted-foreground">{club.memberCount} members</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't joined any clubs yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;