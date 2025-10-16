# Ideas Module - UI Improvements

## Overview

Updated the Ideas module UI to display new extended fields from the AI content generation system and added interactive buttons for feedback and idea polishing.

---

## Changes Made

### 1. API Service (`api/ideas.service.ts`)

#### Extended `IdeaAttributes` Interface
Added new fields:
- `brandFacet`: Brand facet the idea reveals
- `recommendedChannel`: Best publication channel
- `alternativeTitles`: Array of 2-3 title variants
- `draftText`: Full draft text (1000-2000 characters)
- `visualDescription`: Description of image/visual
- `announcementText`: LinkedIn announcement text
- `content_strategy`: Relation to content strategy

#### New API Methods
```typescript
// Like an idea
async likeIdea(id: string | number): Promise<{ ok: boolean }>

// Dislike an idea
async dislikeIdea(id: string | number): Promise<{ ok: boolean }>

// Polish an idea (expand using AI)
async polishIdea(id: string | number): Promise<{
  success: boolean;
  polished: Idea;
  usedContext: string[];
}>
```

---

### 2. Idea Detail View (`views/IdeaDetail.vue`)

#### New UI Components

**Alternative Titles Section**
- Displays all title variants as chips
- Outlined primary color chips for easy scanning

**Brand Facet & Channel**
- Two-column layout on desktop
- Shows brand facet and recommended channel prominently

**Draft Text Card**
- Full draft text displayed in outlined card
- Pre-wrapped text to preserve formatting
- Shows the 1000-2000 character AI-generated draft

**Visual Description Card**
- Outlined card with purple image icon
- Displays visual/image description for content

**Announcement Text Card**
- Outlined card with blue LinkedIn icon
- Shows LinkedIn announcement text if available

**Polished Content Card**
- Success-colored tonal card
- Shows polished/expanded text when available
- Pre-wrapped text formatting

**Content Strategy Chip**
- Purple outlined chip showing linked strategy name

#### Interactive Buttons

**Like Button**
- Green outlined button with thumb-up icon
- Records user preference for content format
- Shows success snackbar on completion
- Disables during other actions

**Dislike Button**
- Red outlined button with thumb-down icon
- Records user preference against content format
- Shows warning snackbar on completion
- Disables during other actions

**Polish Button**
- Purple elevated button with auto-fix icon
- Expands short idea into full publication text
- Uses AI agent with transcription memory
- Shows loading state during processing
- Opens dialog with results

#### Polish Dialog

**Dialog Features:**
- Purple header with sparkles icon
- Shows polished idea title
- Displays context used from transcription as chips
- Full polished text preview in tonal card
- Action buttons:
  - Close dialog
  - View polished idea (navigates to new cloned idea)

#### Snackbar Notifications
- Success (green): Like, Polish success
- Warning (yellow): Dislike recorded
- Error (red): Action failures
- 3-second auto-dismiss

---

### 3. Ideas List View (`views/IdeasList.vue`)

#### Enhanced Card Display

**Title Section**
- Truncated title with status badge
- Hover effect on cards

**Subtitle Section**
- Creation date on left
- "Polished" indicator chip on right (purple with sparkles icon)

**Card Content:**
1. **Brand Facet Chip** (if available)
   - Small purple tonal chip at top
   
2. **Recommended Channel** (if available)
   - Hash icon with channel name
   
3. **Hook/Question**
   - Displayed with "Hook:" label
   
4. **Short Description**
   - Truncated to 100 characters
   - Grey text for subtle appearance
   
5. **Tags**
   - Extra-small chips below content

**Card Actions**
- "View Details" button with arrow icon
- Small size for compact appearance

#### Helper Functions
```typescript
truncateText(text: string, maxLength: number): string
```
Truncates text to specified length with ellipsis.

---

## Usage Flow

### Viewing Ideas
1. Navigate to `/ideas` to see list of all ideas
2. Cards show:
   - Status badge (new/ready/published)
   - Polished indicator if expanded version exists
   - Brand facet and recommended channel
   - Hook and short description
   - Tags

### Viewing Idea Details
1. Click on any idea card or "View Details"
2. See complete idea with all fields:
   - Alternative title options
   - Brand facet & channel
   - Hook, description, full draft text
   - Visual description
   - LinkedIn announcement
   - Related strategy and audio source

### Providing Feedback
1. Click "Like" to indicate good content format
2. Click "Dislike" to indicate poor content format
3. Feedback is recorded for AI learning

### Polishing Ideas
1. Click "Polish" button on idea detail page
2. Wait for AI to expand the idea using transcription memory
3. Dialog shows:
   - New polished version
   - Context details used from transcription
4. Click "View Polished Idea" to see full expanded version
5. Polished version is a new cloned idea with `polishedBody` field

---

## Technical Notes

### Authentication
All API methods (like, dislike, polish) require authentication token from localStorage.

### Error Handling
- Try-catch blocks on all async operations
- User-friendly error messages in snackbars
- Loading states prevent duplicate actions

### Responsive Design
- Two-column layout (Brand Facet & Channel) stacks on mobile
- Card grid: 1 column mobile, 2 tablet, 3 desktop
- All text fields handle overflow gracefully

### Icons Used
- `mdi-thumb-up`: Like button
- `mdi-thumb-down`: Dislike button
- `mdi-auto-fix`: Polish button
- `mdi-sparkles`: Polished indicator
- `mdi-image-outline`: Visual description
- `mdi-linkedin`: Announcement text
- `mdi-arrow-left`: Back button
- `mdi-arrow-right`: View details

---

## Future Enhancements

1. **Feedback Analytics**
   - Show aggregate like/dislike counts
   - Display user's own feedback status

2. **Polish History**
   - Link original and polished versions
   - Show polish history tree

3. **Batch Polish**
   - Polish multiple ideas at once
   - Queue system for processing

4. **Export Features**
   - Export draft text
   - Copy announcement text to clipboard
   - Download visual description

5. **Editing**
   - Edit polished text before publishing
   - Regenerate with different parameters

---

End of UI Improvements Documentation

