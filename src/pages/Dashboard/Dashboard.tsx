import { useState } from "react";
import { Calendar, DollarSign, CreditCard, Package } from "lucide-react";

const Dashboard = () => {
  // state to store start and end date from inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <>
      {/* below the main tag have 3 childs */}
      <main className="p-4 space-y-6">

        {/* header with page title */}
        <header>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </header>

        {/* below this, the section tag have 1 child, which is a date-range input */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-12">
          <label className="text-gray-600 font-medium">Select Date Range:</label>

          {/* start date input */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <span className="text-gray-500">to</span>

          {/* end date input */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </section>

        {/* below, the section tags have 4 different cards to show dynamic data */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 items-stretch">

          {/* card 1 */}
          <article>
            <div className="bg-white p-8 h-full rounded-xl shadow-md flex items-center gap-4">
              {/* icon */}
              <div className="bg-purple-600 text-white p-3 rounded-full">
                <DollarSign size={24} />
              </div>

              <div>
                {/* dynamic value */}
                <h3 className="text-lg font-semibold text-gray-800">PKR 0.00</h3>
                {/* label */}
                <p className="text-gray-500 text-sm">Total Sales</p>
              </div>
            </div>
          </article>

          {/* card 2 */}
          <article>
            <div className="bg-white p-8 h-full rounded-xl shadow-md flex items-center gap-4">
              {/* icon */}
              <div className="bg-purple-600 text-white p-3 rounded-full">
                <CreditCard size={24} />
              </div>

              <div>
                {/* dynamic value */}
                <h3 className="text-lg font-semibold text-gray-800">PKR 0.00</h3>
                {/* label */}
                <p className="text-gray-500 text-sm">Total Expenses</p>
              </div>
            </div>
          </article>

          {/* card 3 */}
          <article>
            <div className="bg-white p-8 h-full rounded-xl shadow-md flex items-center gap-4">
              {/* icon */}
              <div className="bg-purple-600 text-white p-3 rounded-full">
                <Package size={24} />
              </div>

              <div>
                {/* dynamic value */}
                <h3 className="text-lg font-semibold text-gray-800">PKR 0.00</h3>
                {/* label */}
                <p className="text-gray-500 text-sm">Payment Sent</p>
              </div>
            </div>
          </article>

          {/* card 4 */}
          <article>
            <div className="bg-white p-8 h-full rounded-xl shadow-md flex items-center gap-4">
              {/* icon */}
              <div className="bg-purple-600 text-white p-3 rounded-full">
                <Calendar size={24} />
              </div>

              <div>
                {/* dynamic value */}
                <h3 className="text-lg font-semibold text-gray-800">PKR 0.00</h3>
                {/* label */}
                <p className="text-gray-500 text-sm">Payment Received</p>
              </div>
            </div>
          </article>

        </section>
      </main>
    </>
  );
};

export default Dashboard;
