export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  handle: string | null; // kyozo_handle
  photoURL: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithHandle extends UserProfile {
  handle: string; // Non-null handle
}

// Check if a user has set up their handle
export function hasHandle(user: UserProfile): user is UserWithHandle {
  return user.handle !== null;
}
