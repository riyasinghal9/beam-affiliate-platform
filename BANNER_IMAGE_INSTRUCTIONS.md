# Banner Image Setup Instructions

## Adding the Banner Image to the Home Page

To add the provided banner image to the home page, follow these steps:

### 1. Save the Banner Image
1. Save the provided banner image as `beam-banner.jpg`
2. Place it in the `frontend/public/` directory
3. The file should be located at: `frontend/public/beam-banner.jpg`

### 2. Image Specifications
- **Format**: JPG or PNG
- **Recommended size**: 1920x1080 pixels or similar aspect ratio
- **File size**: Keep under 2MB for optimal loading
- **Quality**: High quality but optimized for web

### 3. Current Implementation
The home page has been updated to include the banner image with the following features:
- Background image with cover sizing
- 70% white overlay for text readability
- Responsive design that works on all devices
- Proper z-index layering for content

### 4. Customization Options
If you need to adjust the overlay opacity or styling, you can modify the following in `frontend/src/pages/Home.tsx`:

```tsx
// To change overlay opacity (currently 70%)
<div className="absolute inset-0 bg-white/70"></div>

// To change overlay color
<div className="absolute inset-0 bg-black/50"></div> // 50% black overlay
<div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div> // Gradient overlay
```

### 5. Testing
After adding the image:
1. Start the frontend development server
2. Navigate to the home page
3. Verify the image displays correctly
4. Check that text remains readable
5. Test on different screen sizes

### 6. Alternative Image Locations
If you prefer to host the image elsewhere:
1. Upload to a CDN or image hosting service
2. Update the `backgroundImage` URL in the Home.tsx file
3. Ensure the image is publicly accessible

The banner image will enhance the visual appeal of the home page while maintaining excellent text readability through the overlay system.
