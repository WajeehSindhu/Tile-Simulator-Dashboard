import { useState, useEffect } from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { IoGridSharp } from "react-icons/io5";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [openSimulator, setOpenSimulator] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth <= 1024;
      setIsSmallScreen(isSmall);
      setIsSidebarOpen(!isSmall);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const tileSimulatorRoutes = [
      "/dashboard/all-tiles",
      "/dashboard/tiles/add",
      "/dashboard/categories",
      "/dashboard/colors",
      "/dashboard/submissions",
    ];

    if (isSmallScreen && tileSimulatorRoutes.includes(location.pathname)) {
      setOpenSimulator(false);
    }
  }, [location.pathname, isSmallScreen]);

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md whitespace-nowrap transition-all duration-300 ease hover:text-[#BD5B4C] font-poppins font-light ${
      isActive ? "text-[#BD5B4C] font-semibold bg-gray-700" : ""
    }`;

  return (
    <div
      className={`${
        isSidebarOpen ? "w-64 p-4" : "w-auto py-5"
      } min-h-screen bg-[#212529] text-white space-y-2 transition-all duration-300 relative`}
    >
      {/* Dashboard Link */}
      <NavLink to="/dashboard" className={linkClass}>
        <div className="flex items-center gap-3 group relative">
          <AiOutlineDashboard className="text-xl" />
          {isSidebarOpen ? (
            <span className="font-light text-base font-poppins">Dashboard</span>
          ) : (
            <span className="absolute left-10 font-poppins bg-black text-white text-xs px-2 py-1 rounded shadow-md hidden group-hover:block whitespace-nowrap z-50">
              Dashboard
            </span>
          )}
        </div>
      </NavLink>

      {/* Tile Simulator */}
      <div>
        <div
          onClick={() => {
            if (isSmallScreen) setOpenSimulator(!openSimulator);
          }}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700 rounded-md hover:text-[#BD5B4C] transition-all duration-300 group relative"
        >
          <IoGridSharp className="text-xl" />
          {isSidebarOpen ? (
            <span className="font-light font-poppins">Tile Simulator</span>
          ) : (
            <span className="absolute left-14 bg-black font-poppins text-white text-xs px-2 py-1 rounded shadow-md hidden group-hover:block whitespace-nowrap z-50">
              Tile Simulator
            </span>
          )}
        </div>

        {/* Sub-links: always show on large screen, toggle on small screen */}
        {(openSimulator || !isSmallScreen) && (
          <div
            className={`mt-1 space-y-1 ${
              !isSidebarOpen
                ? "absolute left-16 top-14 bg-[#2C2F33] px-6 py-2 rounded-md z-50"
                : ""
            }`}
          >
            <NavLink to="/dashboard/all-tiles" className={linkClass}>
              All Tiles
            </NavLink>
            <NavLink to="/dashboard/add-tile" className={linkClass}>
              Add New Tile
            </NavLink>
            <NavLink to="/dashboard/categories" className={linkClass}>
              Tile Categories
            </NavLink>
            <NavLink to="/dashboard/colors" className={linkClass}>
              Tile Colors
            </NavLink>
            <NavLink to="/dashboard/submissions" className={linkClass}>
              Submissions
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
