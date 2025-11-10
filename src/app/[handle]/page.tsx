'use client';

import { useState, useEffect, FormEvent } from 'react';
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
  const [email, setEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

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

  // Handle subscription form submission
  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscribeError('Please enter a valid email address');
      return;
    }
    
    setSubscribeLoading(true);
    setSubscribeError('');
    
    try {
      // In a real app, you would send this to your backend/API
      console.log('Subscribing email:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscribeSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscribeError('Failed to subscribe. Please try again.');
    } finally {
      setSubscribeLoading(false);
    }
  };
  
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
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-white/20 rounded mb-8"></div>
            <div className="h-8 w-64 bg-white/20 rounded mb-12"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-black/20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-10 pb-24 md:pb-40">
        <div className="max-w-4xl mx-auto text-center">
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
    <div className="container mx-auto px-4 pt-2 md:pt-16 pb-24 md:pb-40">
      <div className="max-w-4xl mx-auto">
        {/* Community Header Section */}
        <div className=" overflow-hidden rounded-lg p-8" 
             style={{ 
              //  background: 'linear-gradient(to bottom, rgba(229,231,235,0.05), rgba(209,213,219,0.02))',
              //  backgroundImage: 'url("/bg.png")',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundBlendMode: 'overlay'
             }}>
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full overflow-hidden mr-4 border-2 border-white/20">
              <Image 
                src={profileUser.photoURL || '/logo.png'} 
                alt={`${profileUser.firstName} ${profileUser.lastName}`} 
                width={64} 
                height={64} 
                className="object-cover border-12 border-white/20"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#4D5F71]">@{handle} space</h2>
              <p className="text-[#4D5F71]">A living journal of ideas, process, and creative evolution</p>
            </div>
          </div>
          <div className="mt-10 mb-8 overflow-visible">
            <h1 className="text-5xl md:text-7xl font-bold" style={{ 
              background: 'linear-gradient(to top right, #596086, #B2778C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              paddingBottom: '0.2em',
              lineHeight: '1.3'
            }}>Exploring the space between sound and thought</h1>
          </div>
        </div>
        
        {/* Subscription Box */}
        <div className="mb-12 relative overflow-hidden rounded-lg">
          <Image 
            src="/subscribe_bg.png" 
            alt="Subscribe background" 
            width={1200} 
            height={200} 
            className="w-full h-auto"
            priority
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-[#f7df1e] mb-2">I'd love you to join the community</h3>
            <p className="text-gray-300 mb-6 max-w-2xl text-base">
              Get exclusive content, updates, and insights delivered straight to your inbox. Members will be 
              able to respond to content pieces, and receive private responses to what Willer writes. Willer 
              will respond where possible.
            </p>
            <form onSubmit={handleSubscribe} className="w-full">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={subscribeLoading || subscribeSuccess}
                />
                <button 
                  type="submit" 
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium ml-2 px-8 py-3 rounded-full transition-colors disabled:opacity-70"
                  style={{ backgroundColor: '#c084fc' }}
                  disabled={subscribeLoading || subscribeSuccess}
                >
                  {subscribeLoading ? 'SUBSCRIBING...' : subscribeSuccess ? 'SUBSCRIBED!' : 'SUBSCRIBE'}
                </button>
              </div>
              {subscribeError && (
                <p className="text-red-400 text-sm mt-2">{subscribeError}</p>
              )}
              {subscribeSuccess && (
                <p className="text-green-400 text-sm mt-2">Successfully subscribed! Thank you for joining.</p>
              )}
            </form>
          </div>
        </div>
        
        {/* User Bio (if available) */}
        {profileUser.bio && (
          <div className="mb-8">
            <p className="text-white/90">{profileUser.bio}</p>
          </div>
        )}
        
        {/* Content Creation Buttons */}
        <div className="mb-12 grid grid-cols-3" style={{ gap: '2px' }}>
          <div className="relative overflow-hidden rounded-lg">
            <Image 
              src="/text_card_bg.png" 
              alt="Text button background" 
              className="absolute inset-0 w-full h-full object-cover z-0"
              width={200}
              height={60}
            />
            {isOwner ? (
              <Button asChild variant="outline" className="relative z-10 w-full border-purple-600 text-purple-600 hover:bg-purple-600/10 bg-transparent p-8">
                <Link href={`/${handle}/create/text`} className="w-full flex items-center justify-center">
                  <PenLine className="mr-2 h-4 w-4" />
                  Write Text
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="relative z-10 w-full border-purple-600 text-purple-600 opacity-60 cursor-not-allowed p-8" disabled>
                <PenLine className="mr-2 h-4 w-4" />
                Write Text
              </Button>
            )}
          </div>
          
          <div className="relative overflow-hidden rounded-lg">
            <Image 
              src="/audio_card_bg.png" 
              alt="Audio button background" 
              className="absolute inset-0 w-full h-full object-cover z-0"
              width={200}
              height={60}
            />
            {isOwner ? (
              <Button asChild variant="outline" className="relative z-10 w-full border-blue-600 text-blue-600 hover:bg-blue-600/10 bg-transparent p-8">
                <Link href={`/${handle}/create/audio`} className="w-full flex items-center justify-center">
                  <Mic className="mr-2 h-4 w-4" />
                  Record Audio
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="relative z-10 w-full border-blue-600 text-blue-600 opacity-60 cursor-not-allowed" disabled>
                <Mic className="mr-2 h-4 w-4" />
                Record Audio
              </Button>
            )}
          </div>
          
          <div className="relative overflow-hidden rounded-lg">
            <Image 
              src="/video_card_bg.png" 
              alt="Video button background" 
              className="absolute inset-0 w-full h-full object-cover z-0"
              width={200}
              height={60}
            />
            {isOwner ? (
              <Button asChild variant="outline" className="relative z-10 w-full border-[#FFB619] text-[#FFB619] hover:bg-[#FFB619]/10 bg-transparent p-8">
                <Link href={`/${handle}/create/video`} className="w-full flex items-center justify-center">
                  <Video className="mr-2 h-4 w-4" />
                  Record Video
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="relative z-10 w-full border-[#FFB619] text-[#FFB619] opacity-60 cursor-not-allowed" disabled>
                <Video className="mr-2 h-4 w-4" />
                Record Video
              </Button>
            )}
          </div>
        </div>
        
        {/* Content Tabs */}
        {/* <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-black/20">
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
              <div className="bg-black/20 rounded-lg p-8">
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
