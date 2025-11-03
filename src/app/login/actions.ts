'use server';

import { redirect } from 'next/navigation';
import { createSession } from '@/lib/session';

export async function loginAction(
  prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email');
  const password = formData.get('password');
  const redirectTo = formData.get('redirectTo') as string || '/post';

  if (email === 'willer@kyozo.com' && password === 'Hongkong16*') {
    await createSession();
    redirect(redirectTo);
  } else {
    return { error: 'Invalid email or password.' };
  }
}
