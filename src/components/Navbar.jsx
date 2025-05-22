import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from '@heroicons/react/24/solid'; // import user icon

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [userImage, setUserImage] = useState('');

  useEffect(() => {
    const storedImage = localStorage.getItem('userImage');
    if (storedImage) {
      setUserImage(storedImage);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      localStorage.setItem('userImage', base64String);
      setUserImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <nav className="bg-black px-5 py-2">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex items-center gap-2">
            <div className='h-8 w-auto'>
              <img
                className="w-full h-full object-cover"
                src="/Images/Site-Logo.png"
                alt="Site Logo"
                loading='lazy'
              />
            </div>
            <div className='font-poppins text-xl text-white'>
              <span>Lili Tile</span>
            </div>
          </div>

          <div className="flex items-center justify-end  space-x-4">
            <span className="text-gray-700 font-medium text-white font-poppins">{user?.name}</span>

            <label className="relative w-9 h-9 border-2 border-[#bd5b4c] bg-white rounded-full overflow-hidden cursor-pointer flex items-center justify-center font-poppins">
              {userImage ? (
                <img
                  src={userImage}
                  alt="User"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-gray-400" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>

            <button
              onClick={signOut}
              className="bg-[#bd5b4c] font-poppins hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 ease"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
