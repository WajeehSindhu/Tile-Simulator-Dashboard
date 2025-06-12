import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { UserIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [userImage, setUserImage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("userImage");
    if (storedImage) {
      setUserImage(storedImage);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      localStorage.setItem("userImage", base64String);
      setUserImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <nav className="bg-black px-5 py-2">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="/Images/Site-Logo.png"
              alt="Site Logo"
              className="h-8 w-auto object-cover"
              loading="lazy"
            />
            <span className="font-poppins text-xl text-white">Lili Tile</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="font-medium text-white font-poppins">
              {user?.userName || "Admin"}
            </span>

            <div className="relative" ref={dropdownRef}>
              {/* Avatar Button */}
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 border-2 border-[#bd5b4c] bg-white rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-xs font-medium text-gray-500"
              >
                {userImage ? (
                  <img
                    src={userImage}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5 text-black" />
                )}
              </div>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={triggerImageUpload}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Hidden input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
