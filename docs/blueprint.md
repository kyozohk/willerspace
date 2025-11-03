# **App Name**: Willer's Space

## Core Features:

- Content Display: Display Willer Pool's posts in chronological order with support for various content types (text, audio).
- Authentication: Secure the /post route so only willer@kyozo.com can log in with the password Hongkong16* to create new posts.
- Content Creation: Enable authenticated users to create and publish new content to the platform. Post text, background images for the cards and more.
- Background Image Storage: Store the provided background images (and images added by the user) in Firestore for usage in the content cards.
- Subscribe Form: Allows new users to get updates straight to their inbox using email addresses. Members will receive updates when Willer makes new content.

## Style Guidelines:

- Primary color: Soft purple (#A080B3) to create a contemplative and creative ambiance. This color draws inspiration from the photo with Willer Community background image.
- Background color: Light gray (#F0F0F0) with 20% saturation provides a muted canvas to allow Willer's content to stand out without harsh contrast.
- Accent color: Dusty rose (#BC8F8F) will highlight the action and the contrast of background. Accent colors must be harmonious
- Headline font: 'Playfair', serif, for elegant and fashionable titles. Body font: 'PT Sans', sans-serif, for readability and clarity. Note: currently only Google Fonts are supported.
- Minimalist icons that complement the content's tone and style. Avoid unnecessary ornamentation in icons.
- A clean and organized layout with a focus on readability and visual appeal. Cards with background images stored in Firestore will provide content separation.
- Subtle transitions and animations for a smooth user experience. Animations should be used to enhance the user journey and should be implemented after initial app generation.