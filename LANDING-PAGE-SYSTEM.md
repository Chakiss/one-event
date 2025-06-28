# 🎨 Event Landing Page Customization System

## 📝 Overview

ระบบที่ให้ผู้จัดงานสามารถสร้าง landing page ที่ปรับแต่งได้สำหรับแต่ละ event โดยมีฟีเจอร์:

- ✨ **Visual Editor** - แก้ไขผ่าน UI ง่ายๆ
- 🎨 **Theme Customization** - เปลี่ยนสี ฟอนต์
- 📝 **Content Management** - จัดการเนื้อหาแต่ละส่วน
- 🔗 **Custom URL** - ใช้ slug ที่กำหนดเอง
- 💻 **Code Editor** - เพิ่ม HTML/CSS/JS
- 📱 **SEO Optimization** - ตั้งค่า meta tags

## 🏗️ Architecture

### Backend Components

```
src/modules/event/
├── entities/event.entity.ts        # เพิ่มฟิลด์ landing page
├── dto/landing-page.dto.ts          # DTO สำหรับ landing page
├── event.controller.ts              # เพิ่ม endpoints
├── event.service.ts                 # เพิ่ม methods
└── migrations/                      # Database migration
```

### Frontend Components

```
src/components/events/
├── EventLandingPageBuilder.tsx      # Builder interface
└── EventLandingPage.tsx            # Public landing page

src/pages/events/
├── [slug].tsx                      # Public landing page route
└── [id]/landing-page.tsx           # Builder page route
```

## 🔗 API Endpoints

### 1. Update Landing Page
```http
PATCH /events/:id/landing-page
Authorization: Bearer {token}
Content-Type: application/json

{
  "landingPageConfig": {
    "theme": {
      "primaryColor": "#ef4444",
      "secondaryColor": "#6b7280",
      "backgroundColor": "#ffffff",
      "textColor": "#111827",
      "fontFamily": "Inter"
    },
    "hero": {
      "title": "Custom Event Title",
      "subtitle": "Amazing event description",
      "backgroundImage": "https://example.com/bg.jpg",
      "ctaText": "Register Now",
      "ctaColor": "#ef4444"
    },
    "sections": {
      "showAbout": true,
      "showAgenda": true,
      "showSpeakers": false,
      "showLocation": true,
      "showPricing": true,
      "customSections": []
    },
    "contact": {
      "email": "contact@example.com",
      "socialMedia": {
        "facebook": "https://facebook.com/event",
        "twitter": "https://twitter.com/event"
      }
    },
    "seo": {
      "title": "Custom SEO Title",
      "description": "SEO description",
      "keywords": ["event", "conference"],
      "ogImage": "https://example.com/og.jpg"
    }
  },
  "landingPageHtml": "<div>Custom HTML</div>",
  "customCss": ".custom { color: red; }",
  "customJs": "console.log('Hello');",
  "slug": "my-awesome-event"
}
```

### 2. Get Landing Page Config
```http
GET /events/:id/landing-page
Authorization: Bearer {token}
```

### 3. Get Event by Slug (Public)
```http
GET /events/slug/:slug
```

### 4. Preview Landing Page
```http
POST /events/:id/landing-page/preview
Authorization: Bearer {token}
```

## 🎯 Database Schema

### Added Fields to `events` table:

```sql
ALTER TABLE events ADD COLUMN (
  landingPageHtml TEXT,
  landingPageConfig JSON,
  customCss TEXT,
  customJs TEXT,
  slug VARCHAR(100) UNIQUE
);

CREATE INDEX IDX_EVENT_SLUG ON events (slug);
```

### Landing Page Config JSON Structure:

```typescript
interface LandingPageConfig {
  theme?: {
    primaryColor?: string;        // Hex color
    secondaryColor?: string;      // Hex color
    backgroundColor?: string;     // Hex color
    textColor?: string;          // Hex color
    fontFamily?: string;         // Font name
  };
  hero?: {
    title?: string;              // Override event title
    subtitle?: string;           // Hero subtitle
    backgroundImage?: string;    // Background image URL
    backgroundVideo?: string;    // Background video URL
    ctaText?: string;           // Call-to-action text
    ctaColor?: string;          // CTA button color
  };
  sections?: {
    showAbout?: boolean;         // Show/hide about section
    showAgenda?: boolean;        // Show/hide agenda
    showSpeakers?: boolean;      // Show/hide speakers
    showLocation?: boolean;      // Show/hide location
    showPricing?: boolean;       // Show/hide pricing
    showTestimonials?: boolean;  // Show/hide testimonials
    customSections?: Array<{     // Custom content sections
      title: string;
      content: string;
      type: 'text' | 'image' | 'video' | 'html';
      order: number;
    }>;
  };
  contact?: {
    email?: string;              // Contact email
    phone?: string;              // Contact phone
    website?: string;            // Website URL
    socialMedia?: {              // Social media links
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  seo?: {
    title?: string;              // Custom page title
    description?: string;        // Meta description
    keywords?: string[];         // SEO keywords
    ogImage?: string;           // Open Graph image
  };
}
```

## 🎨 Frontend Usage

### 1. Landing Page Builder

```tsx
import EventLandingPageBuilder from '@/components/events/EventLandingPageBuilder';

<EventLandingPageBuilder
  eventId="event-uuid"
  initialConfig={existingConfig}
  initialHtml={existingHtml}
  initialCss={existingCss}
  initialJs={existingJs}
  initialSlug={existingSlug}
/>
```

### 2. Public Landing Page

```tsx
import EventLandingPage from '@/components/events/EventLandingPage';

<EventLandingPage event={eventData} />
```

## 🚀 Features

### 1. Visual Theme Editor
- Color picker สำหรับ primary/secondary colors
- Background color customization
- Font family selection
- Real-time preview

### 2. Content Management
- Hero section customization
- Section visibility toggles
- Custom HTML sections
- SEO settings

### 3. Custom Code Editor
- HTML editor with syntax highlighting
- CSS editor for custom styles
- JavaScript editor for custom functionality
- Security considerations for script execution

### 4. URL Management
- Custom slug generation
- Automatic slug from title
- Uniqueness validation
- SEO-friendly URLs

## 🔒 Security Features

### 1. Authorization
- Only event organizers can edit their landing pages
- Admin users have full access
- JWT-based authentication

### 2. Input Validation
- DTO validation for all inputs
- Slug format validation (a-z, 0-9, hyphens only)
- URL validation for external links
- HTML sanitization for security

### 3. Custom Code Safety
- JavaScript execution warnings
- CSS injection prevention
- XSS protection measures

## 📱 Responsive Design

Landing pages are automatically responsive with:
- Mobile-first design approach
- Flexible grid layouts
- Responsive typography
- Touch-friendly interactions

## 🔍 SEO Optimization

### Automatic Features:
- Open Graph meta tags
- Twitter Card support
- Schema.org event markup
- Sitemap integration

### Customizable:
- Page title and description
- Keywords
- Custom Open Graph image
- Social media previews

## 🎯 Usage Examples

### 1. Basic Landing Page
```javascript
// Minimal configuration
{
  "theme": {
    "primaryColor": "#ef4444"
  },
  "hero": {
    "ctaText": "Join Us!"
  }
}
```

### 2. Full Customization
```javascript
// Complete configuration
{
  "theme": {
    "primaryColor": "#8b5cf6",
    "secondaryColor": "#6b7280",
    "backgroundColor": "#f9fafb",
    "textColor": "#111827",
    "fontFamily": "Poppins"
  },
  "hero": {
    "title": "Annual Tech Summit 2025",
    "subtitle": "Join 500+ developers for the biggest tech event",
    "backgroundImage": "https://images.unsplash.com/photo-tech-conference.jpg",
    "ctaText": "Get Early Bird Tickets",
    "ctaColor": "#8b5cf6"
  },
  "sections": {
    "showAbout": true,
    "showAgenda": true,
    "showSpeakers": true,
    "showLocation": true,
    "showPricing": true,
    "customSections": [
      {
        "title": "Sponsors",
        "content": "<div>Sponsor logos and information</div>",
        "type": "html",
        "order": 1
      }
    ]
  },
  "contact": {
    "email": "info@techsummit.com",
    "website": "https://techsummit.com",
    "socialMedia": {
      "twitter": "https://twitter.com/techsummit",
      "linkedin": "https://linkedin.com/company/techsummit"
    }
  },
  "seo": {
    "title": "Annual Tech Summit 2025 - Register Now",
    "description": "Join 500+ developers at the biggest tech conference of the year",
    "keywords": ["tech", "conference", "developers", "summit"],
    "ogImage": "https://techsummit.com/social-image.jpg"
  }
}
```

## 🚦 Getting Started

### 1. Install Dependencies
```bash
# Frontend
npm install @heroicons/react @headlessui/react react-hot-toast

# Backend dependencies are already included
```

### 2. Run Database Migration
```bash
cd one-event-be
npm run migration:run
```

### 3. Access Builder
```
Navigate to: /events/{event-id}/landing-page
```

### 4. View Public Page
```
Navigate to: /events/{slug}
```

## 🎉 Benefits

### For Event Organizers:
- ✅ Professional landing pages without coding
- ✅ Brand consistency with custom themes
- ✅ Better conversion rates with optimized design
- ✅ SEO benefits for event promotion

### For Attendees:
- ✅ Better user experience
- ✅ Mobile-friendly registration
- ✅ Clear event information
- ✅ Social sharing capabilities

### For Platform:
- ✅ Increased user engagement
- ✅ Premium feature differentiation
- ✅ Better event promotion
- ✅ Analytics opportunities

## 📈 Future Enhancements

- 📊 Analytics integration
- 🎨 Template marketplace
- 🔗 Social media integration
- 📧 Email marketing tools
- 🎥 Video backgrounds
- 🗺️ Interactive maps
- 📱 PWA capabilities
