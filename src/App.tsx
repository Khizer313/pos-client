import { Outlet } from 'react-router-dom'
import React, { useState, useMemo } from 'react'
import DynamicTitle from './DynamicTitle'
import Navbar from './components/Navbar'
import SideMenu from './components/SideMenu'

const App = () => {
  const [menuOpen, setMenuOpen] = useState(true)

  const handleToggle = () => setMenuOpen((prev) => !prev)

  const navbar = useMemo(() => <Navbar toggleMenu={handleToggle} />, [])
  const sidemenu = useMemo(() => <SideMenu menuOpen={menuOpen} />, [menuOpen])

  return (
    <>
      <DynamicTitle />

      <div className="flex h-screen bg-gray-900">
        {sidemenu}

        <div
          className={`flex-1 flex flex-col bg-gray-100 overflow-y-auto transition-margin duration-300 ${
            menuOpen ? 'md:ml-64' : 'md:ml-0'
          }`}
        >
          {navbar}
          <Outlet />
        </div>

        {menuOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </div>
    </>
  )
}

export default React.memo(App)
