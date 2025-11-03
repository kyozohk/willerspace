'use client';

import { useFormState } from 'react-dom';
import { loginAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, undefined);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to');

  return (
    <form className="space-y-6" action={formAction}>
       <input type="hidden" name="redirectTo" value={redirectTo || '/post'} />
      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="mt-2">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue="willer@kyozo.com"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </div>
    </form>
  );
}
