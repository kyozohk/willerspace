'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export function SubscribeForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
 

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });
    form.reset();
  };

  return (
    <div className="w-full mt-16 md:mt-24 relative overflow-hidden rounded-lg">
      <Image 
        src="/subscribe_bg.png" 
        alt="Subscribe background" 
        className="absolute inset-0 w-full h-full object-cover z-0"
        width={1200}
        height={300}
        priority
      />
      <div className="relative z-10 p-8 md:p-10">
        <h2 className="text-3xl font-medium text-yellow-300 mb-4">I'd love you to join the community</h2>
        <p className="text-gray-300 mb-8 max-w-3xl">
          Get exclusive content, updates, and insights delivered straight to your inbox. Members will be 
          able to respond to content pieces, and receive private responses to what Willer writes. Willer 
          will respond where possible.
        </p>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-4 max-w-3xl"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormControl>
                    <Input 
                      placeholder="Enter your email" 
                      {...field} 
                      className="bg-gray-700/50 border-gray-600 text-white h-14 rounded-full px-6 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300 ml-6" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              variant="default" 
              size="lg" 
              disabled={form.formState.isSubmitting} 
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-full px-8 h-14 w-full sm:w-auto"
            >
              {form.formState.isSubmitting ? 'Subscribing...' : 'SUBSCRIBE'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}