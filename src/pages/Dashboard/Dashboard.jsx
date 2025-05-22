import React from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'

const Dashboard = () => {
  return (
   <>
    <div className='w-full min-h-screen overflow-hidden '>
      <Navbar/>
      <Sidebar />
    </div>
   </>
  )
}

export default Dashboard
