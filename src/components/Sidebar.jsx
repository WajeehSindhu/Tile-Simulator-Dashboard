import { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { AiOutlineDashboard } from "react-icons/ai";
import { IoGridSharp } from "react-icons/io5";
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [openSimulator, setOpenSimulator] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md transition-all duration-300 ease hover:text-[#bd5b4c] ${
      isActive ? 'text-[#bd5b4c] font-semibold bg-gray-700' : ''
    }`;

  return (
    <div
      className={`${
        isSidebarOpen ? 'w-64' : 'w-16'
      } h-screen bg-[#212529] text-white p-4 space-y-2 transition-all duration-300 group relative`}
    >
      {/* Dashboard */}
      <NavLink to="/dashboard" className={linkClass}>
        <div className="flex items-center gap-3">
          <AiOutlineDashboard className="text-xl" />
          {isSidebarOpen && <span>Dashboard</span>}
        </div>
      </NavLink>

      {/* Tile Simulator Dropdown */}
      <div>
        <div
          onClick={() => setOpenSimulator(!openSimulator)}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700 rounded-md hover:text-[#bd5b4c] transition-all duration-300 ease"
        >
          <IoGridSharp className="text-xl" />
          {isSidebarOpen && <span>Tile Simulator</span>}
        </div>

        {openSimulator && (
          <div className={`mt-1 space-y-1 ${!isSidebarOpen && 'absolute left-16 top-14 bg-[#2c2f33] p-2 rounded-md'}`}>
            <NavLink to="/dashboard/tiles" className={linkClass}>
              {isSidebarOpen ? 'All Tiles' : <span className="group-hover:inline hidden">All Tiles</span>}
            </NavLink>
            <NavLink to="/dashboard/add-tile" className={linkClass}>
              {isSidebarOpen ? 'Add New Tile' : <span className="group-hover:inline hidden">Add New Tile</span>}
            </NavLink>
            <NavLink to="/dashboard/categories" className={linkClass}>
              {isSidebarOpen ? 'Tile Categories' : <span className="group-hover:inline hidden">Tile Categories</span>}
            </NavLink>
            <NavLink to="/dashboard/colors" className={linkClass}>
              {isSidebarOpen ? 'Tile Colors' : <span className="group-hover:inline hidden">Tile Colors</span>}
            </NavLink>
            <NavLink to="/dashboard/submissions" className={linkClass}>
              {isSidebarOpen ? 'Submissions' : <span className="group-hover:inline hidden">Submissions</span>}
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
