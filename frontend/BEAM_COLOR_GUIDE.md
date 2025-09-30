# 🎨 Beam Brand Color Guide

## **Brand Color Philosophy**

> "The Beam colours define the brands soul. It is essential that the use of colours be consistent across all applications."

## **Primary Colors**

### **Pink (#FF2069) - Primary Brand Color**
- **Context**: Associated with **USERS**
- **Usage**: Main brand identity, primary actions, highlights, user-focused elements
- **Shades**: Available from 50 (lightest) to 900 (darkest)
- **Examples**: 
  - Primary buttons
  - User avatars
  - Success states
  - Main CTAs
  - Brand headers

### **Charcoal (#06303A) - Primary Brand Color**
- **Context**: Core brand identity
- **Usage**: Text, backgrounds, secondary elements, professional appearance
- **Shades**: Available from 50 (lightest) to 900 (darkest)
- **Examples**:
  - Body text
  - Navigation backgrounds
  - Footer sections
  - Professional cards
  - Secondary buttons

## **Secondary Colors**

### **Teal (#54D9C9) - Partners Context**
- **Context**: Used in the context of **PARTNERS**
- **Usage**: Partner-related features, affiliate elements, collaboration features
- **Shades**: Available from 50 (lightest) to 900 (darkest)
- **Examples**:
  - Partner dashboard elements
  - Affiliate link buttons
  - Collaboration features
  - Partner onboarding
  - Team management

### **Purple (#5030E2) - Merchants/Businesses Context**
- **Context**: Used in the context of **MERCHANTS / BUSINESSES**
- **Usage**: Business features, merchant tools, enterprise elements
- **Shades**: Available from 50 (lightest) to 900 (darkest)
- **Examples**:
  - Business dashboard
  - Merchant tools
  - Enterprise features
  - Business analytics
  - Professional services

### **Yellow (#F6C838) - General Accent**
- **Context**: General accent color
- **Usage**: Warnings, highlights, attention-grabbing elements
- **Shades**: Available from 50 (lightest) to 900 (darkest)
- **Examples**:
  - Warning messages
  - Important notifications
  - Feature highlights
  - Achievement badges
  - Promotional elements

### **Grey (#191919) - Secondary Grey**
- **Context**: Supporting neutral color
- **Usage**: Secondary text, borders, subtle backgrounds
- **Shades**: Available from 50 (lightest) to 900 (darkest)
- **Examples**:
  - Secondary text
  - Border elements
  - Disabled states
  - Subtle backgrounds
  - Muted elements

## **Color Usage Guidelines**

### **Context-Based Color Application**

1. **User-Focused Features** → Use **Pink** (#FF2069)
   - User registration
   - Personal dashboard
   - User settings
   - Profile management

2. **Partner/Affiliate Features** → Use **Teal** (#54D9C9)
   - Affiliate dashboard
   - Commission tracking
   - Partner tools
   - Referral systems

3. **Business/Merchant Features** → Use **Purple** (#5030E2)
   - Business analytics
   - Merchant tools
   - Enterprise features
   - Professional services

4. **General Accents** → Use **Yellow** (#F6C838)
   - Notifications
   - Warnings
   - Highlights
   - Achievements

5. **Professional Elements** → Use **Charcoal** (#06303A)
   - Navigation
   - Headers
   - Professional cards
   - Secondary actions

### **Accessibility Considerations**

- **Contrast**: Ensure sufficient contrast between text and background colors
- **Color Blindness**: Don't rely solely on color to convey information
- **Shades**: Use lighter shades for backgrounds, darker shades for text
- **Testing**: Test color combinations for accessibility compliance

## **Tailwind CSS Classes**

### **Background Colors**
```css
.bg-beam-pink-500      /* Primary pink background */
.bg-beam-charcoal-500  /* Primary charcoal background */
.bg-beam-teal-500      /* Partner context background */
.bg-beam-purple-500    /* Business context background */
.bg-beam-yellow-500    /* Accent background */
.bg-beam-gradient      /* Pink to purple gradient */
```

### **Text Colors**
```css
.text-beam-primary      /* Primary pink text */
.text-beam-secondary    /* Primary charcoal text */
.text-beam-teal        /* Partner context text */
.text-beam-purple       /* Business context text */
.text-beam-yellow      /* Accent text */
.gradient-text-beam     /* Gradient text */
```

### **Border Colors**
```css
.border-beam-primary    /* Primary pink border */
.border-beam-secondary  /* Primary charcoal border */
.border-beam-teal      /* Partner context border */
.border-beam-purple     /* Business context border */
.border-beam-yellow    /* Accent border */
```

### **Button Classes**
```css
.btn-beam-primary       /* Primary pink button */
.btn-beam-secondary     /* Primary charcoal button */
.btn-beam-teal         /* Partner context button */
.btn-beam-purple        /* Business context button */
.btn-beam-yellow       /* Accent button */
.btn-beam-gradient     /* Gradient button */
```

### **Card Classes**
```css
.card-beam              /* Default beam card */
.card-beam-charcoal     /* Charcoal theme card */
.card-beam-teal         /* Partner context card */
.card-beam-purple       /* Business context card */
```

## **CSS Custom Properties**

All colors are available as CSS custom properties:

```css
:root {
  --beam-pink: #FF2069;
  --beam-charcoal: #06303A;
  --beam-teal: #54D9C9;
  --beam-purple: #5030E2;
  --beam-yellow: #F6C838;
  
  /* Plus all shade variations */
  --beam-pink-50, --beam-pink-100, etc.
}
```

## **Implementation Examples**

### **User Dashboard**
```jsx
<div className="bg-beam-pink-50 border border-beam-pink-200 rounded-2xl p-6">
  <h2 className="text-beam-pink-700 text-2xl font-bold">Welcome Back!</h2>
  <button className="btn-beam-primary">View Profile</button>
</div>
```

### **Partner Section**
```jsx
<div className="bg-beam-teal-50 border border-beam-teal-200 rounded-2xl p-6">
  <h3 className="text-beam-teal-700 text-xl font-semibold">Partner Tools</h3>
  <button className="btn-beam-teal">Manage Partners</button>
</div>
```

### **Business Features**
```jsx
<div className="bg-beam-purple-50 border border-beam-purple-200 rounded-2xl p-6">
  <h3 className="text-beam-purple-700 text-xl font-semibold">Business Analytics</h3>
  <button className="btn-beam-purple">View Reports</button>
</div>
```

## **Color Palette Reference**

### **Primary Colors**
| Color | HEX | RGB | Usage |
|-------|-----|-----|-------|
| Pink | #FF2069 | 255, 32, 105 | Users, primary actions |
| Charcoal | #06303A | 6, 48, 58 | Professional elements |

### **Secondary Colors**
| Color | HEX | RGB | Usage |
|-------|-----|-----|-------|
| Teal | #54D9C9 | 84, 217, 201 | Partners context |
| Purple | #5030E2 | 80, 48, 226 | Merchants/Businesses |
| Yellow | #F6C838 | 246, 200, 56 | General accent |
| Grey | #191919 | 25, 25, 25 | Supporting neutral |

## **Best Practices**

1. **Consistency**: Use the same color for the same type of element across the platform
2. **Context**: Apply colors according to their intended context (users, partners, businesses)
3. **Balance**: Don't overuse bright colors; use charcoal and grey for balance
4. **Hierarchy**: Use color to establish visual hierarchy and importance
5. **Branding**: Ensure the pink (#FF2069) is prominently featured as the main brand color

## **Color Combinations**

### **Recommended Combinations**
- **Primary**: Pink + Charcoal (main brand identity)
- **Partner**: Teal + Charcoal (professional partner experience)
- **Business**: Purple + Charcoal (enterprise feel)
- **Accent**: Yellow + Charcoal (attention-grabbing elements)

### **Avoid Combinations**
- Pink + Purple (too similar, may cause confusion)
- Teal + Yellow (poor contrast)
- Multiple bright colors together (overwhelming)

---

**Remember**: These colors define The Beam brand's soul. Use them consistently and thoughtfully to maintain brand integrity across all applications. 