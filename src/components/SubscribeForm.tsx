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
import { Mail } from 'lucide-react';

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
        title: state.message,
        description: state.isError ? "Please try again." : "You're on the list!",
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
        className="flex w-full max-w-md items-start space-x-2"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Enter your email" {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
          Subscribe
        </Button>
      </form>
    </Form>
  );
}
