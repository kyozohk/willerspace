import { PostForm } from './_components/PostForm';

export default function PostPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
      <div className="space-y-4 mb-8">
        <h1 className="font-headline text-4xl font-bold">Create a new post</h1>
        <p className="text-muted-foreground">Share your thoughts, sounds, and visuals with the world.</p>
      </div>
      <PostForm />
    </div>
  );
}
