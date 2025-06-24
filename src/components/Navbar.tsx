import { Bell, User, Settings, Menu } from "lucide-react"

const Navbar = ({ toggleMenu }: { toggleMenu: () => void }) => {
  return (
    <nav className="flex items-center justify-between bg-gray-800 text-white px-4 py-3 ">
      {/* Left - Menu Button */}
      <button onClick={toggleMenu} className="p-2 hover:bg-gray-700 rounded">
        <Menu />
      </button>

      {/* Right - Icons */}
      <div className="flex gap-4 items-center">
        <Bell className="hover:text-blue-400 cursor-pointer" />
        <Settings className="hover:text-blue-400 cursor-pointer" />
        <User className="hover:text-blue-400 cursor-pointer" />
      </div>
    </nav>
  )
}

export default Navbar
