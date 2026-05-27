export default function Navbar() {
  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Enterprise Insights
        </h1>

        <p className="text-sm text-gray-500">
          Dashboard
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <input
          type="text"
          placeholder="Search workflows..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-72 outline-none bg-gray-50"
        />

        {/* Notification */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
          🔔
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-gray-200 px-4 py-2 rounded-xl cursor-pointer">
          {/* Initials Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
            AU
          </div>

          {/* User Info */}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Admin User
            </p>

            <p className="text-xs text-gray-500">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}