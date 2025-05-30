import { useState } from "react";
import { Link } from "react-router";

const Header = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/update`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Update failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Update successful:", data);
    } catch (error) {
      console.error("Update error:", error);
      setUpdateError(error.message || "Failed to update. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <header className="flex items-center gap-6 p-4 bg-white shadow-sm relative md:p-8 md:gap-6 flex-wrap">
      {/* Logo */}
      <Link to="/">
        <img
          src="/logo.png"
          alt="Site Logo"
          className="h-16 w-16 rounded-full object-cover scale-125"
        />
      </Link>

      {/* Update Button */}
      <div className="relative flex flex-col items-end">
        <button
          onClick={handleUpdateClick}
          disabled={isUpdating}
          className={`px-6 py-3 rounded-md font-medium whitespace-nowrap transition-colors
            ${
              isUpdating
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }
          `}
          aria-busy={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
        {updateError && (
          <div className="text-red-600 text-sm mt-1 text-right">
            {updateError}
          </div>
        )}
      </div>

      {/* Search Button as a Link */}
      <Link
        to="/search"
        className="px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        Search
      </Link>

      {/* Mobile layout adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          header {
            gap: 0.5rem;
          }
          .search-container {
            width: 100%;
            order: 3;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
