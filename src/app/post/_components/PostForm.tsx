'use client';

import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createPostAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const postFormSchema = z.object({
  content: z.string().min(1, { message: 'Post content cannot be empty.' }).max(2000),
  backgroundImage: z.string().min(1, { message: 'Please select or upload a background image.' }),
  customBackgroundImage: z.any().optional(),
  audioFile: z.any().optional(),
}).refine(data => {
    if (data.backgroundImage === 'upload' && !data.customBackgroundImage) {
        return false;
    }
    return true;
}, {
    message: "Please upload a background image if you select the 'Upload new' option.",
    path: ["customBackgroundImage"],
});


export function PostForm() {
  const [state, formAction] = useFormState(createPostAction, {
    message: '',
    isError: false,
  });
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: '',
      backgroundImage: PlaceHolderImages[0].id,
    },
  });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.isError ? 'Error' : 'Success',
        description: state.message,
        variant: state.isError ? 'destructive' : 'default',
      });
      if (!state.isError) {
        form.reset();
        setImagePreview(null);
        setAudioPreview(null);
      }
    }
  }, [state, toast, form]);
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('customBackgroundImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('audioFile', file);
      setAudioPreview(file.name);
    }
  };


  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[150px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backgroundImage"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Background Image</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {PlaceHolderImages.map((image) => (
                    <FormItem key={image.id}>
                      <FormControl>
                        <div>
                          <RadioGroupItem value={image.id} id={image.id} className="peer sr-only" />
                          <Label
                            htmlFor={image.id}
                            className="block relative h-24 rounded-md overflow-hidden cursor-pointer ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary"
                          >
                            <Image src={image.imageUrl} alt={image.description} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                                <p className="text-white text-xs">{image.description}</p>
                            </div>
                          </Label>
                        </div>
                      </FormControl>
                    </FormItem>
                  ))}
                   <FormItem>
                      <FormControl>
                        <div>
                          <RadioGroupItem value="upload" id="upload" className="peer sr-only" />
                          <Label
                            htmlFor="upload"
                            className={cn("flex flex-col items-center justify-center h-24 rounded-md border-2 border-dashed cursor-pointer", field.value === 'upload' && 'ring-2 ring-primary border-primary')}
                          >
                            <UploadCloud className="h-8 w-8 text-muted-foreground" />
                            <span className="mt-2 text-sm font-medium">Upload new</span>
                          </Label>
                        </div>
                      </FormControl>
                    </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch('backgroundImage') === 'upload' && (
          <FormField
            control={form.control}
            name="customBackgroundImage"
            render={() => (
                <FormItem>
                    <FormLabel>Custom Background Image</FormLabel>
                    <FormControl>
                       <Input type="file" accept="image/*" onChange={handleImageFileChange} />
                    </FormControl>
                    {imagePreview && 
                        <div className="relative mt-4 w-48 h-32 rounded-md overflow-hidden">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    }
                    <FormMessage />
                </FormItem>
            )}
            />
        )}

        <FormField
          control={form.control}
          name="audioFile"
          render={() => (
            <FormItem>
              <FormLabel>Audio (Optional)</FormLabel>
              <FormControl>
                 <Input type="file" accept="audio/*" onChange={handleAudioFileChange} />
              </FormControl>
               {audioPreview && 
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                        {audioPreview}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                            form.setValue('audioFile', null);
                            setAudioPreview(null);
                        }}>
                           <X className="h-4 w-4" />
                        </Button>
                    </div>
                }
              <FormDescription>Upload an audio file to accompany your post.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Publishing...' : 'Publish Post'}
        </Button>
      </form>
    </Form>
  );
}
