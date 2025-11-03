'use server';

import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email(),
});

export async function subscribeAction(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please enter a valid email.',
      isError: true,
    };
  }

  try {
    // Here you would typically add the email to a mailing list service
    console.log(`New subscription from: ${validatedFields.data.email}`);
    return {
      message: 'Thank you for subscribing!',
      isError: false,
    };
  } catch (e) {
    return {
      message: 'Something went wrong. Please try again later.',
      isError: true,
    };
  }
}
