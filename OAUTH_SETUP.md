# 🔐 OAuth Provider Setup Guide for Kload

This guide will help you configure OAuth providers (Google, GitHub, Apple) for your Kload e-commerce application using Clerk.

## 📋 Prerequisites

- Clerk account with your Kload application created
- Access to Google Cloud Console, GitHub, and Apple Developer Console
- Your application running on `http://localhost:3000` (development)

## 🌐 1. Google OAuth Setup

### Step 1: Google Cloud Console Configuration

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create a new project** or select an existing one
3. **Enable APIs**:
   - Go to "APIs & Services" → "Library"
   - Search for and enable:
     - Google+ API
     - Google Identity API
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set **Application Type**: Web application
   - Add **Authorized redirect URIs**:
     ```
     https://clerk.your-domain.com/v1/oauth_callback
     http://localhost:3000/sign-in/callback
     ```
5. **Copy Credentials**:
   - Note down your **Client ID** and **Client Secret**

### Step 2: Clerk Dashboard Configuration

1. **Go to [Clerk Dashboard](https://dashboard.clerk.com)**
2. **Select your Kload application**
3. **Navigate to**: User & Authentication → Social Connections
4. **Click on Google** → **Configure**
5. **Enter your credentials**:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. **Save configuration**

## 🐙 2. GitHub OAuth Setup

### Step 1: GitHub OAuth App Configuration

1. **Go to [GitHub Settings](https://github.com/settings/developers)**
2. **Click "New OAuth App"**
3. **Fill in the details**:
   - **Application name**: Kload
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: Kload E-commerce Platform
   - **Authorization callback URL**: `https://clerk.your-domain.com/v1/oauth_callback`
4. **Register application**
5. **Copy Credentials**:
   - Note down your **Client ID** and **Client Secret**

### Step 2: Clerk Dashboard Configuration

1. **In Clerk Dashboard**: User & Authentication → Social Connections
2. **Click on GitHub** → **Configure**
3. **Enter your credentials**:
   - **Client ID**: Your GitHub OAuth Client ID
   - **Client Secret**: Your GitHub OAuth Client Secret
4. **Save configuration**

## 🍎 3. Apple OAuth Setup

### Step 1: Apple Developer Console Configuration

1. **Go to [Apple Developer](https://developer.apple.com)**
2. **Navigate to**: Certificates, Identifiers & Profiles
3. **Create Services ID**:
   - Click "Identifiers" → "+" → "Services IDs"
   - **Description**: Kload OAuth
   - **Identifier**: com.yourdomain.kload (unique identifier)
   - **Enable "Sign In with Apple"**
4. **Configure Return URLs**:
   - Add: `https://clerk.your-domain.com/v1/oauth_callback`
5. **Generate Private Key**:
   - Go to "Keys" → "+" → "Sign In with Apple"
   - **Key Name**: Kload OAuth Key
   - **Download the key** and note the **Key ID**
6. **Note your Team ID** (found in top right of developer console)

### Step 2: Clerk Dashboard Configuration

1. **In Clerk Dashboard**: User & Authentication → Social Connections
2. **Click on Apple** → **Configure**
3. **Enter your credentials**:
   - **Services ID**: Your Apple Services ID
   - **Key ID**: Your generated Key ID
   - **Team ID**: Your Apple Developer Team ID
   - **Private Key**: Upload or paste your private key content
4. **Save configuration**

## 🔧 4. Environment Variables

Update your `.env.local` file with the correct domain:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YmFsYW5jZWQtbGlnZXItMjMuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_EmlxpohCU34tywlo0gJx9h1xfh94gbirA1V9zrG2eG

# Add your domain for production
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 🚀 5. Testing OAuth Providers

### Test Each Provider:

1. **Start your application**: `npm run dev`
2. **Go to**: `http://localhost:3000/login`
3. **Test each OAuth button**:
   - Google: Should redirect to Google login
   - GitHub: Should redirect to GitHub authorization
   - Apple: Should redirect to Apple Sign In

### Expected Behavior:

- ✅ **OAuth buttons appear** in the login form
- ✅ **Clicking buttons** redirects to respective providers
- ✅ **Successful authentication** redirects back to your app
- ✅ **User is logged in** and can access protected routes

## 🛠️ 6. Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**:
   - Check that redirect URIs match exactly in both Clerk and OAuth provider
   - Include both development and production URLs

2. **"Client ID not found"**:
   - Verify Client ID is copied correctly
   - Check that OAuth app is properly configured

3. **"Permission denied"**:
   - Ensure required APIs are enabled (Google)
   - Check OAuth app permissions (GitHub)

4. **Apple Sign In not working**:
   - Verify Services ID is correct
   - Check that private key is properly formatted
   - Ensure Team ID is correct

### Debug Steps:

1. **Check browser console** for errors
2. **Verify Clerk dashboard** configuration
3. **Test with different browsers**
4. **Check network tab** for failed requests

## 📱 7. Production Deployment

When deploying to production:

1. **Update redirect URIs** in all OAuth providers
2. **Add production domain** to Clerk settings
3. **Update environment variables** with production values
4. **Test OAuth flow** in production environment

## 🎯 8. Security Best Practices

- ✅ **Never commit** OAuth secrets to version control
- ✅ **Use environment variables** for all sensitive data
- ✅ **Regularly rotate** OAuth client secrets
- ✅ **Monitor OAuth usage** in provider dashboards
- ✅ **Implement proper error handling** for OAuth failures

## 📞 Support

If you encounter issues:

1. **Check Clerk documentation**: https://clerk.com/docs
2. **Review OAuth provider documentation**
3. **Check browser console** for detailed error messages
4. **Verify all configuration steps** were completed correctly

---

**Your Kload e-commerce application now has enterprise-grade OAuth authentication! 🚀**
