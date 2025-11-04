'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { isHandleOwner } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { TextCard } from '@/components/TextCard';
import { VoiceCard } from '@/components/VoiceCard';
import { VideoCard } from '@/components/VideoCard';
import { EditableTextCard } from '@/components/EditableTextCard';
import { EditableVoiceCard } from '@/components/EditableVoiceCard';
import { EditableVideoCard } from '@/components/EditableVideoCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, Mic, Video, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserByHandle } from '@/lib/users';
import { getUserContent } from '@/lib/content';
import { adaptContent } from '@/lib/content-adapters';
import { UserProfile } from '@/types/user';
import { Content } from '@/types/content';
import { Post, AudioPost, VideoPost } from '@/lib/content-adapters';

export default function UserFeedPage() {
  const { handle } = useParams();
  const { user } = useAuthContext();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchUserAndContent = async () => {
      if (!handle || typeof handle !== 'string') return;
      
      try {
        // Fetch user profile by handle
        const userProfile = await getUserByHandle(handle);
        setProfileUser(userProfile);
        
        if (userProfile) {
          // Check if current user is the owner of this profile
          const ownerStatus = user ? await isHandleOwner(user.uid, handle) : false;
          setIsOwner(ownerStatus);
          
          // Fetch user content
          const userContent = await getUserContent(userProfile.uid);
          setContent(userContent);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndContent();
  }, [handle, user]);

  // Filter content based on active tab
  const filteredContent = content.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'text') return item.type === 'read';
    if (activeTab === 'audio') return item.type === 'listen';
    if (activeTab === 'video') return item.type === 'watch';
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-white/20 rounded mb-8"></div>
            <div className="h-8 w-64 bg-white/20 rounded mb-12"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-white/70 mb-8">The user you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-5xl mx-auto">
        {/* User Profile Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            {profileUser.firstName} {profileUser.lastName}
          </h1>
          <p className="text-xl text-white/70 mb-6">@{handle}</p>
          {profileUser.bio && (
            <p className="text-white/90 mb-6">{profileUser.bio}</p>
          )}
        </div>
        
        {/* Content Creation Buttons (Only visible to owner) */}
        {isOwner && (
          <div className="mb-12 flex flex-wrap gap-4">
            <div className="relative overflow-hidden rounded-lg">
              <Image 
                src="/text_card_bg.png" 
                alt="Text button background" 
                className="absolute inset-0 w-full h-full object-cover z-0"
                width={200}
                height={60}
              />
              <Button asChild variant="outline" className="relative z-10 border-purple-600 text-purple-600 hover:bg-purple-600/10 bg-transparent">
                <Link href={`/${handle}/create/text`}>
                  <PenLine className="mr-2 h-4 w-4" />
                  Write Text
                </Link>
              </Button>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <Image 
                src="/audio_card_bg.png" 
                alt="Audio button background" 
                className="absolute inset-0 w-full h-full object-cover z-0"
                width={200}
                height={60}
              />
              <Button asChild variant="outline" className="relative z-10 border-blue-600 text-blue-600 hover:bg-blue-600/10 bg-transparent">
                <Link href={`/${handle}/create/audio`}>
                  <Mic className="mr-2 h-4 w-4" />
                  Record Audio
                </Link>
              </Button>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <Image 
                src="/video_card_bg.png" 
                alt="Video button background" 
                className="absolute inset-0 w-full h-full object-cover z-0"
                width={200}
                height={60}
              />
              <Button asChild variant="outline" className="relative z-10 border-[#FFB619] text-[#FFB619] hover:bg-[#FFB619]/10 bg-transparent">
                <Link href={`/${handle}/create/video`}>
                  <Video className="mr-2 h-4 w-4" />
                  Record Video
                </Link>
              </Button>
            </div>
          </div>
        )}
        
        {/* Content Tabs */}
        {/* <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-white/10">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>
        </Tabs> */}
        
        {/* Content List */}
        <div className="space-y-8">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => {
              if (item.type === 'read') {
                const post = adaptContent(item, handle as string) as Post;
                return isOwner ? (
                  <EditableTextCard 
                    key={item.id} 
                    post={post} 
                    layout="desktop"
                    isOwner={isOwner}
                    userId={user?.uid || ''}
                    handle={handle as string}
                  />
                ) : (
                  <TextCard 
                    key={item.id} 
                    post={post} 
                    layout="desktop"
                  />
                );
              } else if (item.type === 'listen') {
                const post = adaptContent(item, handle as string) as AudioPost;
                return isOwner ? (
                  <EditableVoiceCard 
                    key={item.id} 
                    post={post} 
                    layout="desktop"
                    isOwner={isOwner}
                    userId={user?.uid || ''}
                    handle={handle as string}
                  />
                ) : (
                  <VoiceCard 
                    key={item.id} 
                    post={post} 
                    layout="desktop"
                  />
                );
              } else if (item.type === 'watch') {
                const post = adaptContent(item, handle as string) as VideoPost;
                return isOwner ? (
                  <EditableVideoCard 
                    key={item.id} 
                    post={post} 
                    layout="desktop"
                    isOwner={isOwner}
                    userId={user?.uid || ''}
                    handle={handle as string}
                  />
                ) : (
                  <VideoCard 
                    key={item.id} 
                    post={post} 
                    layout="desktop"
                  />
                );
              }
              return null;
            })
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/10 rounded-lg p-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-white/70" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No Content Yet</h3>
                <p className="text-white/70 mb-6">
                  {isOwner 
                    ? "You haven't created any content yet. Use the buttons above to get started!"
                    : `${profileUser.firstName} hasn't created any content yet.`}
                </p>
                {isOwner && (
                  <div className="relative overflow-hidden rounded-lg inline-block">
                    <Image 
                      src="/text_card_bg.png" 
                      alt="Text button background" 
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      width={200}
                      height={60}
                    />
                    <Button asChild variant="outline" className="relative z-10 border-purple-600 text-purple-600 hover:bg-purple-600/10 bg-transparent">
                      <Link href={`/${handle}/create/text`}>Create Your First Post</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
