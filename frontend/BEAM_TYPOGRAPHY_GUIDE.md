# 🎨 Beam Brand Typography Guide

## **Typography Philosophy**

> "Typography is a strong extension of the brands personality."

## **Official Beam Typography Specifications**

Based on the official brand guidelines, here are the exact typography specifications:

| Element | Font Weight | Font Size | Line Height | Usage |
|---------|-------------|-----------|-------------|-------|
| **H1** | Nunito Extra Bold | 28pt | 32pt | Main page headings |
| **H2** | Nunito Extra Bold | 20pt | 26pt | Section headings |
| **H3** | Nunito Bold | 15pt | 20pt | Subsection headings |
| **Big Paragraph** | Nunito Bold | 10.2pt | 16pt | Important text, buttons |
| **Paragraph** | Nunito Regular | 9.4pt | 16pt | Body text, descriptions |

**Note**: All sizes are converted from points (pt) to rem units for web implementation.

## **Primary Font Family**

### **Nunito**
The primary font-family used throughout the app and for Beam's marketing material is **Nunito**.

**Font Weights Available:**
- **200** - Extra Light
- **300** - Light
- **400** - Regular
- **500** - Medium
- **600** - SemiBold
- **700** - Bold
- **800** - ExtraBold
- **900** - Black

**Primary Weights for Beam Brand:**
- **Nunito Extra Bold (800)**: H1 and H2 headings
- **Nunito Bold (700)**: H3 headings and big paragraph text
- **Nunito Regular (400)**: Regular paragraph text
- **Nunito Light (300)**: Secondary content, subtle text
- **Nunito SemiBold (600)**: Navigation, buttons, emphasis text

### **Fallback Fonts**
Fall back fonts such as Helvetica and Arial can be used where Nunito cannot be implemented.

**Font Stack:**
```css
font-family: 'Nunito', 'Helvetica', 'Arial', system-ui, sans-serif;
```

## **Kerning Guidelines**

### **Beam Kerning Standards**
As a guide, kerning should be set to approximately **80-90%** of the font size, keeping the type airy and modern.

**Kerning Values:**
- **Tight (80%)**: `-0.02em` - Used for headings and large text
- **Normal (85%)**: `-0.01em` - Used for body text and general content
- **Wide (90%)**: `0.01em` - Used for special emphasis or display text

## **Typography Scale**

### **Official Beam Typography Classes**
Based on the official brand guidelines with exact specifications:

```css
/* Official Beam Typography Scale */
.text-beam-h1      /* 28pt / 32pt - Nunito Extra Bold */
.text-beam-h2      /* 20pt / 26pt - Nunito Extra Bold */
.text-beam-h3      /* 15pt / 20pt - Nunito Bold */
.text-beam-big     /* 10.2pt / 16pt - Nunito Bold */
.text-beam-para    /* 9.4pt / 16pt - Nunito Regular */

/* Additional sizes for flexibility */
.text-beam-xs      /* 0.75rem, line-height: 1.2, tracking: -0.02em */
.text-beam-sm      /* 0.875rem, line-height: 1.3, tracking: -0.02em */
.text-beam-base    /* 1rem, line-height: 1.4, tracking: -0.01em */
.text-beam-lg      /* 1.125rem, line-height: 1.5, tracking: -0.01em */
.text-beam-xl      /* 1.25rem, line-height: 1.4, tracking: -0.01em */
.text-beam-2xl     /* 1.5rem, line-height: 1.3, tracking: -0.01em */
.text-beam-3xl     /* 1.875rem, line-height: 1.2, tracking: -0.02em */
.text-beam-4xl     /* 2.25rem, line-height: 1.1, tracking: -0.02em */
.text-beam-5xl     /* 3rem, line-height: 1, tracking: -0.02em */
.text-beam-6xl     /* 3.75rem, line-height: 1, tracking: -0.02em */
.text-beam-7xl     /* 4.5rem, line-height: 1, tracking: -0.02em */
```

## **Font Weight Classes**

### **Beam Font Weight Utilities**
```css
.font-nunito-light      /* font-weight: 300 */
.font-nunito-semibold   /* font-weight: 600 */
.font-nunito-extrabold  /* font-weight: 800 */
```

### **Kerning Utilities**
```css
.tracking-beam-tight    /* letter-spacing: -0.02em (80%) */
.tracking-beam-normal   /* letter-spacing: -0.01em (85%) */
.tracking-beam-wide     /* letter-spacing: 0.01em (90%) */
```

## **Usage Guidelines**

### **Headings & Titles**
- **H1 Headings**: Use `text-beam-h1` with `font-nunito-extrabold` (28pt/32pt)
- **H2 Headings**: Use `text-beam-h2` with `font-nunito-extrabold` (20pt/26pt)
- **H3 Headings**: Use `text-beam-h3` with `font-nunito-bold` (15pt/20pt)

**Example:**
```jsx
<h1 className="text-beam-h1 font-nunito-extrabold tracking-beam-tight">
  Make Money Online
</h1>

<h2 className="text-beam-h2 font-nunito-extrabold tracking-beam-tight">
  Start Your Journey
</h2>

<h3 className="text-beam-h3 font-nunito-bold tracking-beam-normal">
  Section Title
</h3>
```

### **Body Text**
- **Big Paragraph Text**: Use `text-beam-big` with `font-nunito-bold` (10.2pt/16pt)
- **Regular Paragraph Text**: Use `text-beam-para` with `font-nunito-regular` (9.4pt/16pt)
- **Main Content**: Use `font-nunito-regular` with `tracking-beam-normal`
- **Descriptions**: Use `font-nunito-light` with `tracking-beam-normal`
- **Captions**: Use `font-nunito-light` with `tracking-beam-wide`

**Example:**
```jsx
<p className="text-beam-lg font-nunito-light tracking-beam-normal">
  Perfect for anyone with social media, WhatsApp groups, or communities.
</p>
```

### **Navigation & Buttons**
- **Navigation Links**: Use `font-nunito-semibold` with `tracking-beam-normal`
- **Button Text**: Use `font-nunito-semibold` with `tracking-beam-normal`
- **Menu Items**: Use `font-nunito-semibold` with `tracking-beam-normal`

**Example:**
```jsx
<Link className="font-nunito-semibold tracking-beam-normal">
  Dashboard
</Link>

<button className="font-nunito-semibold tracking-beam-normal">
  Start Earning
</button>
```

### **Special Elements**
- **Logo Wordmark**: Use `font-nunito-semibold italic` with `tracking-beam-normal`
- **Badges**: Use `font-nunito-semibold` with `tracking-beam-normal`
- **Emphasis Text**: Use `font-nunito-semibold` with `tracking-beam-normal`

## **Implementation Examples**

### **Hero Section**
```jsx
<div className="text-center">
  {/* Badge */}
  <div className="inline-flex items-center bg-beam-teal-100 border border-beam-teal-200 rounded-full px-4 py-2 mb-8">
    <span className="text-beam-teal-800 text-beam-big font-nunito-bold tracking-beam-normal">
      Join 10,000+ Successful Resellers
    </span>
  </div>
  
  {/* Main Heading */}
  <h1 className="text-beam-h1 sm:text-beam-h2 lg:text-beam-h1 font-nunito-extrabold text-beam-charcoal-900 mb-6 leading-tight tracking-beam-tight">
    Make Money Online
  </h1>
  
  {/* Description */}
  <p className="text-beam-big sm:text-beam-para lg:text-beam-big font-nunito-regular text-beam-charcoal-700 mb-10 max-w-3xl mx-auto leading-relaxed tracking-beam-normal">
    Perfect for anyone with social media, WhatsApp groups, or communities.
  </p>
</div>
```

### **Navigation**
```jsx
<nav className="font-nunito">
  <Link className="text-beam-charcoal-700 hover:text-beam-pink-600 px-3 py-2 rounded-lg text-sm font-nunito-semibold tracking-beam-normal">
    Dashboard
  </Link>
</nav>
```

### **Cards & Components**
```jsx
<div className="card-beam">
  <h3 className="text-xl font-nunito-semibold tracking-beam-normal mb-2">
    Card Title
  </h3>
  <p className="text-base font-nunito-light tracking-beam-normal">
    Card description with proper typography.
  </p>
</div>
```

## **CSS Implementation**

### **Font Loading**
```html
<!-- Google Fonts - Nunito -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
```

### **Base Typography**
```css
body {
  font-family: 'Nunito', 'Helvetica', 'Arial', system-ui, sans-serif;
  font-feature-settings: 'kern' 1;
  text-rendering: optimizeLegibility;
}
```

### **Typography Utilities**
```css
@layer utilities {
  .font-nunito-light {
    font-family: 'Nunito', 'Helvetica', 'Arial', sans-serif;
    font-weight: 300;
  }
  
  .font-nunito-semibold {
    font-family: 'Nunito', 'Helvetica', 'Arial', sans-serif;
    font-weight: 600;
  }
  
  .font-nunito-extrabold {
    font-family: 'Nunito', 'Helvetica', 'Arial', sans-serif;
    font-weight: 800;
  }
  
  .tracking-beam-tight {
    letter-spacing: -0.02em; /* 80% of font size */
  }
  
  .tracking-beam-normal {
    letter-spacing: -0.01em; /* 85% of font size */
  }
  
  .tracking-beam-wide {
    letter-spacing: 0.01em; /* 90% of font size */
  }
}
```

## **Best Practices**

### **Typography Hierarchy**
1. **Use consistent font weights** for similar elements
2. **Maintain proper kerning** for readability
3. **Choose appropriate line heights** for content length
4. **Ensure sufficient contrast** between text and background

### **Responsive Typography**
- **Mobile**: Use smaller font sizes with tighter line heights
- **Desktop**: Use larger font sizes with more generous line heights
- **Maintain kerning ratios** across all screen sizes

### **Accessibility**
- **Font sizes**: Minimum 16px for body text
- **Line heights**: Minimum 1.4 for readability
- **Contrast**: Ensure WCAG AA compliance
- **Font loading**: Provide fallbacks for better performance

## **Tailwind Configuration**

### **Font Family**
```javascript
fontFamily: {
  'beam': ['Nunito', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
  'sans': ['Nunito', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
  'nunito': ['Nunito', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
},
```

### **Letter Spacing**
```javascript
letterSpacing: {
  'beam-tight': '-0.02em',    // 80% of font size
  'beam-normal': '-0.01em',   // 85% of font size
  'beam-wide': '0.01em',      // 90% of font size
},
```

### **Font Sizes**
```javascript
fontSize: {
  'beam-xs': ['0.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
  'beam-sm': ['0.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
  'beam-base': ['1rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
  'beam-lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
  'beam-xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
  'beam-2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
  'beam-3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
  'beam-4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  'beam-5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
  'beam-6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
  'beam-7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
},
```

---

**Remember**: Typography is a strong extension of The Beam brand's personality. Use Nunito consistently with proper kerning to maintain the airy, modern aesthetic that defines the brand. 