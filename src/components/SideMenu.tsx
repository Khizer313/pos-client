import { useState } from 'react';
import { Home, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// >>>>>>>>>>>> Types <<<<<<<<<<<<<
type MenuItem = {
  label: string;
  path: string;
};

type DropdownItem = {
  title: string;
  items: MenuItem[];
};

type Props = {
  menuOpen: boolean;
};

const SideMenu = ({ menuOpen }: Props) => {

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // open the dropdown based on its index Number, if the index number is already used then i will set null to close the dropdown, and if not then i will set to index to open the dropdown
  const toggleDropdown = (index: number) => {
    setOpenDropdown(prev => prev === index ? null : index);
  };

  // these are the main dropdowns shown in sidebar, each dropdown contains a title and an array of menu items
  const dropdowns: DropdownItem[] = [
    {title: "Parties",items: [{ label: "Customers", path: "/customers" },{ label: "Suppliers", path: "/suppliers" }],},
    {title: "Product Manager",items: [{ label: "Brands", path: "/brands" },{ label: "Categories", path: "/categories" },{ label: "Variations", path: "/variations" },{ label: "Products", path: "/products" }],},
    {title: "Sales",items: [{ label: "Sales", path: "/sales" },{ label: "Sales Return / Cr.Note", path: "/salesreturn" },{ label: "Payment In", path: "/paymentin" },{ label: "Quotation / Estimate", path: "/estimate" }],},
    {title: "Purchases",items: [{ label: "Purchases", path: "/purchases" },{ label: "Purchase Return / Dr. Note", path: "/purchasereturn" },{ label: "Payment Out", path: "/paymentout" }],},
    ...Array(2).fill({title: "Section",items: [
        { label: "Item 1", path: "/item1" },
        { label: "Item 2", path: "/item2" }
      ],
    }),
  ];

  return (
    // This component is the SIDEBAR of this project, which takes 20% space, In this component i've parent div with 2 childs, first child is logo section and second one is scrollable content section

    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-100 z-40 ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >

      {/* >>>>>>>>>>>>>>>>>>>   Logo Section  <<<<<<<<<<<<<<<<<<<<<< */}
      <Link to='/'>
        <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Home className="text-blue-400" />
            <span className="truncate">Ahmed Computers</span>
          </h1>
        </div>
      </Link>

      {/* >>>>>>>>>>>>>> Scrollable content using Scrollbar, with it's own 2  childs(dashboard button and dropdowns) <<<<<<<<<< */}

        {/* Dashbora button under scroll bar */}
        <Link
          to="/dashboard"
          className="flex items-center p-4 hover:bg-gray-700 transition-colors"
        >
          <LayoutDashboard className="mr-3 min-w-[24px]" />
          <span className="truncate">Dashboard</span>
        </Link>

        {/* >>>>>>>>>>>>>>>>>>>  Dropdowns under scrollbar <<<<<<<<<<<<<<<<<<<< */}
        <div className="pb-4">
          {dropdowns.map((dropdown, index) => (
            <div key={`${dropdown.title}-${index}`} className="border-b border-gray-700">
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <span className="truncate">{dropdown.title}</span>
                {openDropdown === index ?
                  <ChevronUp size={18} className="flex-shrink-0" /> :
                  <ChevronDown size={18} className="flex-shrink-0" />
                }
              </button>

              {/* child dropdown items shown only if dropdown is open */}
              {openDropdown === index && (
                <div className="bg-gray-900">
                  {dropdown.items.map((item, i) => (
                    <Link
                      key={`${item.label}-${i}`}
                      to={item.path}
                      className="block py-2 px-6 hover:bg-gray-800 transition-colors truncate"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};

export default SideMenu;
