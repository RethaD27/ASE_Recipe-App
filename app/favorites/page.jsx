"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import LoadingPage from "../loading";
import BackButton from "@/components/BackButton";
import { Heart } from "lucide-react";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");

        if (!response.ok) throw new Error("Failed to fetch favorites");

        const data = await response.json();
        setFavorites(data.favorites);
      } catch (error) {
        setError("Error fetching favorites: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();

    const handleFavoritesUpdate = () => fetchFavorites();
    const handleRecipeDeleted = (event) => {
      const deletedRecipeId = event.detail.recipeId;
      setFavorites((prevFavorites) =>
        prevFavorites.filter((recipe) => recipe._id !== deletedRecipeId)
      );
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    window.addEventListener("recipeDeleted", handleRecipeDeleted);

    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
      window.removeEventListener("recipeDeleted", handleRecipeDeleted);
    };
  }, [session, router]);

  if (loading) return <LoadingPage />;
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Fixed position back button */}
      <div className="absolute top-3 -left-[6rem] z-10">
        <BackButton className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-2 hover:bg-white transition-colors dark:bg-gray-800 dark:hover:bg-gray-700" />
      </div>

      <div className="flex justify-center items-center mb-6">
        <h1 className="text-4xl mt-8 font-bold mb-10 dark:text-white text-center tracking-tight text-gray-700 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          My Favorite Recipes
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 px-6">
          <Heart className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            You haven't added any favorites yet. Start by adding some!
          </p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                initialIsFavorited={true}
                additionalInfo={`Added: ${new Date(
                  recipe.favorited_at
                ).toLocaleDateString()}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
