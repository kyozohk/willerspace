import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/session';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

async function logoutAction() {
  'use server';
  await deleteSession();
  redirect('/');
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </form>
  );
}
