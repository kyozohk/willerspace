'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { searchUsers } from '@/lib/users';
import { UserProfile } from '@/types/user';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Explore</h1>
        
        {/* Search form */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for users by name or handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Searching...' : <Search className="h-4 w-4" />}
            </Button>
          </form>
        </div>
        
        {/* Search results */}
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Card key={user.uid} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6 flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={user.photoURL || undefined} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-purple-700 text-white">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-white">{user.firstName} {user.lastName}</h3>
                      {user.handle && (
                        <p className="text-white/70">@{user.handle}</p>
                      )}
                    </div>
                    
                    {user.handle && (
                      <Button asChild>
                        <Link href={`/${user.handle}`}>View Profile</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-lg">
                <p className="text-white/70">No users found matching "{searchTerm}"</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-lg">
              <p className="text-white/70">Search for users to see their profiles</p>
            </div>
          )}
        </div>
        
        {/* Featured users section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Creators</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This would typically be populated from the backend */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-purple-700 text-white">WP</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-white text-lg">Willer Pool</CardTitle>
                    <CardDescription className="text-white/70">@willerspace</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 line-clamp-2">
                  Creator and developer of Willerspace. Sharing thoughts on technology and creativity.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/willerspace">View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
