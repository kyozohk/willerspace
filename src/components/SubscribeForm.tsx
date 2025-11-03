'use client';

import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { subscribeAction } from '@/app/actions/subscribe';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export function SubscribeForm() {
  const [state, formAction] = useFormState(subscribeAction, { message: '' });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.isError ? "Error" : "Subscribed!",
        description: state.message,
        variant: state.isError ? 'destructive' : 'default',
      });
      if (!state.isError) {
        form.reset();
      }
    }
  }, [state, toast, form]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        className="flex w-full max-w-md flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-2"
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
                    className="bg-background/50 border-border focus:bg-background/80 focus:ring-primary h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="default" size="lg" disabled={form.formState.isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold w-full sm:w-auto h-12">
          {form.formState.isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </Form>
  );
}