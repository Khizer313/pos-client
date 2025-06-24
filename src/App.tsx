import { Outlet } from 'react-router-dom'
import SideMenu from "./components/SideMenu"
import DynamicTitle from './DynamicTitle'
import { useState } from 'react'
import Navbar from './components/Navbar'

const App = () => {

  // i used this state to open or close Sidebar, the button for opening and closing,is in Navbar.tsx and i'm passing these states to sidemenu.tsx,,if state is true then sidemenu will use translate-x-0 in its css and if the state is false than sidemenu will use -translate-x-full 
  const [menuOpen, setMenuOpen] = useState(true)

  return (
    <>
      {/* this component is my center point of this whole project, 
          in its parent div, i have 2 childs,
          one is sidemenu componets which takes 20% space, and 2nd child is outlet inside its parent which takes 80% space ,
          but also before all of this, i've Dynamic Title component to change the document title of web page accordign to the current path*/}
      <DynamicTitle />

<div className="flex h-screen bg-gray-900">
  <SideMenu menuOpen={menuOpen} />

  <div
    className={`flex-1 flex flex-col bg-gray-100 overflow-y-auto transition-margin duration-300
    ${menuOpen ? "md:ml-64" : "md:ml-0"}
    `}
  >
    <Navbar toggleMenu={() => setMenuOpen(!menuOpen)} />
    <Outlet />
  </div>

  {/* Overlay for mobile when menu is open */}
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

export default App
