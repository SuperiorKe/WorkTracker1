# WorkTracker - Modern Work Log Application with SMS Notifications

WorkTracker is a comprehensive work logging application that enables users to track their work progress with image attachments and receive SMS notifications. Built with React, TypeScript, and Supabase, it provides a seamless experience for documenting daily work activities with visual evidence and real-time notifications.

The application combines modern authentication, real-time database operations, and cloud storage capabilities to deliver a robust work tracking solution. Users can create detailed work logs with descriptions and images, manage their notification preferences, and maintain a chronological record of their work activities. The SMS notification feature, powered by AfricasTalking API, keeps users informed about new work log entries.

## Repository Structure
```
.
├── src/                          # Source code directory
│   ├── context/                  # React context definitions
│   │   └── AuthContext.tsx       # Authentication context provider
│   ├── lib/                      # Utility and configuration files
│   │   └── supabase.ts          # Supabase client configuration
│   ├── pages/                    # Application pages
│   │   ├── Dashboard.tsx         # Main dashboard component
│   │   └── Login.tsx            # Authentication page
│   └── types/                    # TypeScript type definitions
├── supabase/                     # Supabase configuration
│   ├── functions/                # Serverless functions
│   │   └── send-sms/            # SMS notification function
│   └── migrations/              # Database migration files
├── public/                      # Static assets
└── config files                 # Various configuration files
```

## Usage Instructions
### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Supabase account and project
- AfricasTalking account for SMS functionality

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd worktracker

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` file with your credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AFRICAS_TALKING_API_KEY=your_africas_talking_api_key
VITE_AFRICAS_TALKING_USERNAME=your_africas_talking_username
```

### Quick Start
1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

3. Sign up for a new account or log in with existing credentials

4. Start creating work logs by:
   - Adding descriptions
   - Uploading images
   - Enabling SMS notifications (optional)

### More Detailed Examples

Creating a work log with image:
```typescript
// In Dashboard.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!file || !description.trim()) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${user?.id}/${fileName}`;

  // Upload image and create work log
  const { error } = await supabase.storage
    .from('work-logs')
    .upload(filePath, file);
  
  // Additional implementation details...
};
```

### Troubleshooting

Common Issues:
1. **Authentication Errors**
   - Error: "Invalid login credentials"
   - Solution: Verify email and password combination
   - Check browser console for detailed error messages

2. **Image Upload Issues**
   - Error: "Failed to upload image"
   - Solution: 
     - Verify file size (max 10MB)
     - Check file format (PNG, JPG, GIF supported)
     - Ensure proper storage bucket permissions

3. **SMS Notification Issues**
   - Error: "Failed to send SMS notification"
   - Solution:
     - Verify phone number format (international format required)
     - Check AfricasTalking API credentials
     - Monitor Supabase Edge Function logs

## Data Flow
WorkTracker implements a streamlined data flow for managing work logs and notifications.

```ascii
User Input → Authentication → Work Log Creation → Storage
     ↓            ↑               ↓                ↓
  Validation   Database        Image Upload    SMS Notification
```

Component Interactions:
1. Authentication flow handles user sessions and access control
2. Dashboard component manages work log creation and display
3. Supabase client handles real-time database operations
4. Storage service manages image upload and retrieval
5. SMS service processes notification requests
6. Edge functions handle serverless operations
7. Database migrations maintain schema versions