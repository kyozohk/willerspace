'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addPost } from '@/lib/posts';
import { getSession } from '@/lib/session';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const postFormSchema = z.object({
  content: z.string().min(1).max(2000),
  backgroundImage: z.string().min(1),
  customBackgroundImage: z.instanceof(File).optional(),
  audioFile: z.instanceof(File).optional(),
});

async function uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

export async function createPostAction(
  prevState: { message: string; isError: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session) {
    return { message: 'Unauthorized.', isError: true };
  }

  const rawFormData = {
    content: formData.get('content'),
    backgroundImage: formData.get('backgroundImage'),
    customBackgroundImage: formData.get('customBackgroundImage'),
    audioFile: formData.get('audioFile'),
  };
  
  const validatedFields = postFormSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      isError: true,
    };
  }
  
  const { content, backgroundImage, customBackgroundImage, audioFile } = validatedFields.data;

  try {
    let backgroundImageUrl = '';
    if (backgroundImage === 'upload' && customBackgroundImage) {
        if(customBackgroundImage.size === 0) return { message: 'Please upload a background image.', isError: true };
        backgroundImageUrl = await uploadFile(customBackgroundImage, `backgrounds/${Date.now()}-${customBackgroundImage.name}`);
    } else {
        const placeholder = PlaceHolderImages.find(p => p.id === backgroundImage);
        if (!placeholder) return { message: 'Invalid background image selection.', isError: true };
        backgroundImageUrl = placeholder.imageUrl;
    }

    let audioUrl: string | undefined = undefined;
    if (audioFile && audioFile.size > 0) {
        audioUrl = await uploadFile(audioFile, `audio/${Date.now()}-${audioFile.name}`);
    }

    await addPost({
        content,
        backgroundImageUrl,
        audioUrl,
    });

    revalidatePath('/');
    redirect('/');

  } catch (error) {
    console.error('Error creating post:', error);
    return { message: 'Failed to create post. Please try again.', isError: true };
  }
}
