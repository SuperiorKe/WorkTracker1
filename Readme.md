# WorkTracker Application Documentation

## 1. Overview

WorkTracker is a web application designed to help users log their daily work activities. It allows users to create work logs with descriptions and associated images, providing a visual and descriptive record of their work progress. The application uses Supabase for authentication, database storage, and storage of images. It also supports SMS notifications via Africa's Talking API when new work logs are created.

### Main Features:

*   **User Authentication:** Secure user registration and login using Supabase Auth.
*   **Work Log Creation:** Users can create work logs with descriptions and upload images.
*   **Image Storage:** Images are stored in Supabase Storage.
*   **Work Log Display:** Displays a list of work logs with images and descriptions.
*   **SMS Notifications:** Optional SMS notifications via Africa's Talking API when new work logs are added.
*   **Notification Preferences:** Users can toggle SMS notifications on/off.
*   **Phone Number Management:** Users can save their phone number for SMS notifications.

## 2. Installation Instructions

### System Requirements:

*   Node.js (version >= 16)
*   npm (or yarn)
*   Vite
*   Supabase account

### Dependencies:

*   `react`: "^18.3.1"
*   `react-dom`: "^18.3.1"
*   `react-router-dom`: "^6.22.3"
*   `@supabase/supabase-js`: "^2.39.7"
*   `lucide-react`: "^0.344.0"
*   `tailwindcss`: "^3.4.1"
*   `autoprefixer`: "^10.4.18"
*   `postcss`: "^8.4.35"

### Step-by-Step Installation:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Supabase:**

    *   Create a new project on Supabase ([https://supabase.com/](https://supabase.com/)).
    *   Obtain the Supabase URL and anon key from your Supabase project settings.
    *   Update the `.env` file with your Supabase URL and anon key:

        ```
        VITE_SUPABASE_URL=<your_supabase_url>
        VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
        ```

4.  **Set up Africa's Talking API (optional):**

    *   Create an account on Africa's Talking ([https://www.africastalking.com/](https://www.africastalking.com/)).
    *   Obtain your API key, username, and sender ID from your Africa's Talking account.
    *   Update the `.env` file with your Africa's Talking API credentials:

        ```
        AFRICAS_TALKING_API_KEY=<your_africas_talking_api_key>
        AFRICAS_TALKING_USERNAME=<your_africas_talking_username>
        AFRICAS_TALKING_SENDER_ID=<your_africas_talking_sender_id>
        ```

5.  **Apply Supabase Migrations:**

    *   Run the provided SQL migrations in your Supabase project to create the necessary database tables and functions. You can use the Supabase CLI or the Supabase dashboard to run the migrations. The migration files are:

        *   `supabase/migrations/20250424092824_pale_dust.sql`
        *   `supabase/migrations/20250424093851_velvet_wind.sql`
        *   `supabase/migrations/20250424094858_mute_breeze.sql`
        *   `supabase/migrations/20250424114624_quick_bar.sql`
        *   `supabase/migrations/20250424114919_fierce_snow.sql`

6.  **Run the application:**

    ```bash
    npm run dev
    ```

    This will start the development server. Open your browser and navigate to the address provided (usually `http://localhost:5173`).

## 3. Usage Guidelines

### Login/Signup:

*   Navigate to the `/login` route.
*   If you don't have an account, click "Don't have an account? Sign up" to create a new account.
*   Enter your email and password, and click "Sign In" or "Get Started".

### Dashboard:

*   After logging in, you will be redirected to the `/dashboard` route.
*   The dashboard displays a list of your work logs.

### Creating a Work Log:

1.  **Description:** Enter a description of your work in the "Description" textarea.
2.  **Image:** Click "Upload a file" to select an image to upload.
3.  **Add Work Log:** Click the "Add Work Log" button to create the work log.

### SMS Notifications:

1.  **Phone Number:** Enter your phone number in the international format (e.g., +1234567890) in the phone number input field.
2.  **Save Phone Number:** Click the "Save" button next to the phone number input to save your phone number.
3.  **Enable/Disable SMS:** Click the "SMS" button to toggle SMS notifications on or off. When enabled, the bell icon will be green.

### Sign Out:

*   Click the "Sign Out" button in the navigation bar to sign out of the application.

## 4. API Documentation

### Supabase API:

The application uses the Supabase JavaScript client library to interact with the Supabase API.

*   **Authentication:**
    *   `supabase.auth.signInWithPassword({ email, password })`: Signs in a user with email and password.
    *   `supabase.auth.signUp({ email, password })`: Signs up a new user with email and password.
    *   `supabase.auth.signOut()`: Signs out the current user.
    *   `supabase.auth.getSession()`: Retrieves the current session.
    *   `supabase.auth.onAuthStateChange()`: Listens for authentication state changes.

*   **Database:**
    *   `supabase.from('work_logs').select('*')`: Retrieves all work logs.
    *   `supabase.from('work_logs').insert([{ user_id, description, image_url }])`: Creates a new work log.
    *   `supabase.from('notification_preferences').select('sms_enabled').eq('user_id', user?.id).single()`: Retrieves SMS notification preference for a user.
    *   `supabase.from('notification_preferences').update({ sms_enabled: !smsEnabled }).eq('user_id', user?.id)`: Updates SMS notification preference for a user.
    *   `supabase.from('notification_preferences').insert([{ user_id: user?.id, sms_enabled: !smsEnabled }])`: Inserts SMS notification preference for a user.
    *   `supabase.from('users').select('phone_number').eq('id', user?.id).maybeSingle()`: Retrieves phone number for a user.
    *   `supabase.from('users').update({ phone_number: phoneNumber }).eq('id', user?.id)`: Updates phone number for a user.

*   **Storage:**
    *   `supabase.storage.from('work-logs').upload(filePath, file)`: Uploads an image to Supabase Storage.
    *   `supabase.storage.from('work-logs').getPublicUrl(filePath)`: Gets the public URL of an image in Supabase Storage.

### Edge Functions API:

The application uses Supabase Edge Functions to send SMS notifications via Africa's Talking API.

*   **`send-sms` Function:**
    *   **Endpoint:** `https://<your_supabase_url>.supabase.co/functions/v1/send-sms`
    *   **Method:** POST
    *   **Request Body:**

        ```json
        {
          "phone": "+1234567890",
          "message": "New work log added: This is a test work log."
        }
        ```

    *   **Response Body:**

        ```json
        {
          "SMSMessageData": {
            "Recipients": [
              {
                "statusCode": 101,
                "number": "+1234567890",
                "status": "Success",
                "cost": "KES 0.5000"
              }
            ]
          }
        }
        ```

    *   **Authentication:** The Edge Function is invoked using the Supabase client library, which automatically handles authentication.

## 5. Configuration Options and Customization

*   **.env file:**
    *   `VITE_SUPABASE_URL`: Supabase project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Supabase anon key.
    *   `AFRICAS_TALKING_API_KEY`: Africa's Talking API key.
    *   `AFRICAS_TALKING_USERNAME`: Africa's Talking username.
    *   `AFRICAS_TALKING_SENDER_ID`: Africa's Talking sender ID.

*   **Styling:** The application uses Tailwind CSS for styling. You can customize the styling by modifying the `tailwind.config.js` file and the CSS classes in the React components.
*   **Components:** The React components can be customized to modify the application's behavior and appearance.

## 6. Troubleshooting Guide

### Common Issues and Solutions:

*   **Authentication errors:**
    *   Verify that the Supabase URL and anon key are correct in the `.env` file.
    *   Ensure that the user has confirmed their email address.
*   **Database errors:**
    *   Verify that the Supabase database is running and accessible.
    *   Ensure that the database schema is correct and that the necessary tables and functions have been created.
*   **Image upload errors:**
    *   Verify that the Supabase Storage bucket is configured correctly.
    *   Ensure that the user has the necessary permissions to upload images to the bucket.
*   **SMS notification errors:**
    *   Verify that the Africa's Talking API key, username, and sender ID are correct in the `.env` file.
    *   Ensure that the Africa's Talking account has sufficient credit.
    *   Verify that the phone number is in the correct international format.
    *   Check the Edge Function logs for error messages.

## 7. Security Considerations and Best Practices

*   **Authentication:** Use Supabase Auth for secure user authentication.
*   **Authorization:** Implement row-level security (RLS) policies in Supabase to control access to data.
*   **Data validation:** Validate user input to prevent injection attacks.
*   **Environment variables:** Store sensitive information (e.g., API keys) in environment variables.
*   **HTTPS:** Use HTTPS to encrypt communication between the client and the server.

## 8. Performance Optimization Tips

*   **Image optimization:** Optimize images before uploading them to Supabase Storage.
*   **Code splitting:** Use code splitting to reduce the initial load time of the application.
*   **Caching:** Use caching to store frequently accessed data.
*   **Database optimization:** Optimize database queries to improve performance.

## 9. Contribution Guidelines

*   Fork the repository.
*   Create a new branch for your feature or bug fix.
*   Write tests for your code.
*   Submit a pull request.

## 10. Version History and Changelog

*   **v0.0.1 (2025-04-24):**
    *   Initial release.
    *   Basic user authentication.
    *   Work log creation and display.
    *   SMS notifications.
    *   Notification preferences.
    *   Phone number management.
