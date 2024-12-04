# 🍴 Recipe App

## ✨ Project Overview

The Recipe App is a cutting-edge platform designed to revolutionize how users discover, manage, and utilize recipes. Whether you're a home cook, a professional chef, or someone seeking inspiration, our app offers features to simplify and elevate your cooking experience.

### **Live Demo**
https://culinary-haven-a.vercel.app/
<br>

![]()
![]()
![]()

## Project Structure:

```
|-- .env
|-- .eslintignore
|-- .eslintrc.json
|-- .gitignore
|-- app
    |-- api
        |-- allergens
            |-- route.js
        |-- auth
            |-- profile
                |-- route.js
            |-- signup
                |-- route.js
            |-- [...nextauth]
                |-- route.js
        |-- categories
            |-- route.js
        |-- favorites
            |-- route.js
        |-- ingredients
            |-- route.js
        |-- push
        |-- push-notifications
            |-- route.js
        |-- recipes
            |-- route.js
            |-- [id]
                |-- reviews
                    |-- route.js
                |-- route.js
        |-- recommended
            |-- route.js
        |-- shopping-list
            |-- route.js
            |-- [id]
                |-- items
                    |-- route.js
                |-- route.js
        |-- suggestions
            |-- route.js
        |-- sync
        |-- tags
            |-- route.js
    |-- auth
        |-- signin
            |-- page.jsx
        |-- signup
            |-- page.jsx
    |-- downloaded-recipes
        |-- page.jsx
    |-- error.jsx
    |-- favorites
        |-- page.jsx
    |-- globals.css
    |-- layout.jsx
    |-- loading.jsx
    |-- not-found.jsx
    |-- page.jsx
    |-- profile
        |-- page.jsx
    |-- recipes
        |-- [id]
            |-- page.jsx
    |-- shopping-list
        |-- page.jsx
|-- components
    |-- AddRecipeToListButton.jsx
    |-- Alert.jsx
    |-- ArrowButtons.jsx
    |-- BackButton.jsx
    |-- CategoryFilter.jsx
    |-- ClearFiltersButton.jsx
    |-- DownloadButton.jsx
    |-- ErrorShared.jsx
    |-- FavoritesButton.jsx
    |-- FavoritesCount.jsx
    |-- FilterSection.jsx
    |-- Footer.jsx
    |-- Gallery.jsx
    |-- Header.jsx
    |-- HeroSection.jsx
    |-- ImageSelector.jsx
    |-- IngredientsFilter.jsx
    |-- Loader.jsx
    |-- NumberOfStepsFilter.jsx
    |-- OnlineStatus.jsx
    |-- Pagination.jsx
    |-- PushNotificationManager.jsx
    |-- PWAInstallation.jsx
    |-- RecipeCard.jsx
    |-- RecipeCarousel.jsx
    |-- RecipeEdit.jsx
    |-- RecipeGrid.jsx
    |-- ReviewSection.jsx
    |-- SearchBar.jsx
    |-- SessionProvider.jsx
    |-- ShoppingList.jsx
    |-- SortOrder.jsx
    |-- Svg.jsx
    |-- TagFilters.jsx
    |-- TextToSpeech.jsx
    |-- ThemeToggle.jsx
|-- data.js
|-- jsconfig.json
|-- lib
    |-- api.js
    |-- auth.js
    |-- models
        |-- shoppingList.js
    |-- mongodb.jsx
|-- middleware.js
|-- next.config.mjs
|-- package-lock.json
|-- package.json
|-- postcss.config.mjs
|-- project_structure.text
|-- public
    |-- android-chrome-192x192.png
    |-- android-chrome-512x512.png
    |-- apple-touch-icon-72x72.png
    |-- favicon-16x16.png
    |-- favicon-32x32.png
    |-- favicon.ico
    |-- hero_section1.jpg
    |-- logo.png
    |-- service-worker.js
    |-- site.webmanifest
    |-- sw.js
    |-- workbox-f52fd911.js
|-- README.md
|-- scripts
    |-- validateManifest.js
|-- tailwind.config.js
|-- ThemeContext.js

```

## 🌟 Key Features

- 🔍 **Search Recipes**: Find recipes using keywords, cuisine, or ingredients.
- 📥 **Offline Access**: Download recipes for viewing when you're offline.
- 🔔 **Push Notifications**: Receive updates on new recipes, personalized suggestions, and more.
- 🤝 **User-Centric Design**: Navigate an intuitive and sleek interface, making cooking easy and fun.
- 🔑 **User Authentication**: Sign up and log in to save favorites, create shopping lists, and more.

## 💻 Technologies Used

- 🌐 **Frontend**: React, Next.js, and TailwindCSS for responsive design.
- 🔧 **Backend**: Node.js, Express, and Next.js API routes for dynamic content handling.
- 🛢️ **Database**: MongoDB for storing user data, recipes, favorites, and shopping lists.
- 🔌 **APIs**: Integrated with API for fetching recipe data.
- ⚡ **Authentication**: NextAuth.js for managing user authentication with Google and Credentials providers.

## 📩 Contact Us

Have questions or need support? Reach out to the team:

- Email: asegroupa@gmail.com
- GitHub Issues: Report an Issue
- Community: Join us on Discord.

## Contributors - *We're here to help!*
- [Inolofatseng Motloba](https://github.com/InolofatsengMotloba)
- [Neo Mosotho](https://github.com/neomosotho)
- [Rethabile Diale](https://github.com/RethaD27)
- [Ofentse Diale ](https://github.com/OfentseXI)
- [Christopher Tshoma](https://github.com/ChristopherTsh)
- [Ndumiso Sibanda](https://github.com/Ndumiso-Sibanda)
- [Nkosinathi Milanzi](https://github.com/Nathilanzi)
- [Mohau Mushi](https://github.com/MohauMushi)


## 📚 API Documentation

Our app is powered by robust APIs designed to integrate seamlessly with modern applications. Detailed documentation on the available endpoints and their usage can be found in the [API Documentation](API_DOCUMENTATION.md) file.

1. **Recipes**

   - Endpoint: `GET /api/recipes`
   - Description: Fetch recipes based on search queries.
   - Request Example:
     ```json
     {
       "query": "pasta",
       "cuisine": "Italian"
     }
     ```
   - Response Example:
     ```json
     [
       {
         "id": 101,
         "name": "Spaghetti Carbonara",
         "ingredients": ["spaghetti", "eggs", "parmesan"],
         "steps": ["Step 1", "Step 2"]
       }
     ]
     ```

2. **Download Recipe**

   - Endpoint: `POST /api/recipes/download`
   - Description: Save recipes for offline access.
   - Request Example:
     ```json
     {
       "recipeId": 101
     }
     ```
   - Response Example:
     ```json
     {
       "status": "success",
       "message": "Recipe downloaded successfully"
     }
     ```

3. **User Authentication**

   - Signup Endpoint: `POST /api/auth/signup`
   - Login Endpoint: `POST /api/auth/login`
   - Description: Handles user registration and login.
   - Request Example:
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```
   - Response Example:

     ```json
     {
       "status": "success",
       "message": "User registered/logged in successfully",
       "user": {
         "id": "12345",
         "email": "user@example.com"
       },
       "token": "abc123.def456.ghi789"
     }
     ```

     In this structure:

- The `pages/api/` directory contains the API routes, including the recipes and authentication endpoints.
- The `components/` directory holds the reusable UI components, such as the `RecipeCard` and `SearchForm`.
- The `lib/` directory houses utility functions, like the `api.js` file that handles API requests.
- The `global.css/` directory holds the global CSS styles for the application.
- The `next.config.js` and `tailwind.config.js` files configure Next.js and Tailwind CSS, respectively.

## ⚙️ Setting Up Environment Variables

To ensure the app runs smoothly, configure the environment variables by creating a `.env` file in the root directory:

```
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

Replace the placeholders with your actual values.

## 📥 Installation Instructions

Getting started is quick and easy!

1. Clone the Repository
   ```
   git clone https://github.com/zacharyschroder/ASE-GROUPA.git
   cd ASE-GROUPA
   ```
2. Install Dependencies
   ```
   npm install
   ```
3. Set Up Environment Variables
   Create a `.env` file as shown in the Environment Variables section.
4. Start the Application
   ```
   npm run dev
   ```
5. Access the App
   Visit `http://localhost:3000` in your browser.

## 🚀 Git Initialization Guide

This guide provides step-by-step instructions for initializing and setting up a Git repository for our project.

### 🔧 Basic Git Setup

1. Check if Git is installed
   ```
   git --version
   ```
2. Configure your Git identity
   ```
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

### 📂 Setup Instructions

1. Clone the repository
   ```
   git clone https://github.com/CodeSpace-Academy/ASE_2024_GROUP_A.git
   ```
2. Navigate to the project directory
   ```
   cd CodeSpace-Academy/ASE_2024_GROUP_A
   ```
3. Install dependencies
   ```
   npm install
   ```
4. Set up environment variables
   Create a `.env.local` file in the root directory and add your Firebase configuration.
5. Run the development server
   ```
   npm run dev
   ```
   The application should now be running on `http://localhost:3000`.

### 🔗 Connecting to Remote Repository

1. Create a new repository on GitHub.
2. Link your local repository to the remote
   ```
   git remote add origin <repository-url>
   ```
3. Push your code to the remote repository
   ```
   git push -u origin main
   ```

### 💡 Best Practices

- Write clear, descriptive commit messages.
- Use `.gitignore` to exclude unnecessary files.
- Commit frequently with logical changes.
- Keep your repository clean and organized.
- Always pull before pushing when working with others.

### ❗ Common Issues and Solutions

- Git not recognized: Ensure Git is properly installed and added to your system's PATH.
- Permission denied: Check your SSH keys and repository access rights.
- Remote rejection: Verify the repository URL and permissions.

Thank you for making the Recipe App better! 🍳
