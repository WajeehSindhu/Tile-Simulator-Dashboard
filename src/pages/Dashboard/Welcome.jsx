import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";

const Welcome = () => {
  const { tiles, tileCategories, fetchTiles, fetchTileCategories } = useAuth();
 
  useEffect(()=>{
    fetchTiles();
    fetchTileCategories();
  },[])

  return (

    <>
      <Helmet>
        <title>Dashboard - Lili Tile Customizer</title>
        <meta
          name="description"
          content="Welcome to Admin Dashboard  Lili Tile Customizer."
        />
      </Helmet>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to Lili Tile Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Total Tiles</h3>
            <p className="text-2xl text-[#bd5b4c]">{tiles?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Categories</h3>
            <p className="text-2xl text-[#bd5b4c]">{tileCategories?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Submissions</h3>
            <p className="text-2xl text-[#bd5b4c]">0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
