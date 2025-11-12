export default function AdminSettingsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure site-wide settings and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          <section className="rounded border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Site Name</h3>
                  <p className="text-sm text-gray-600">The name displayed in the header</p>
                </div>
                <input
                  type="text"
                  defaultValue="Carve Wiki"
                  className="rounded border border-gray-300 px-3 py-2 w-64"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600">Enable to show maintenance page</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* XP Settings */}
          <section className="rounded border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">XP & Gamification</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">XP per Workout</h3>
                  <p className="text-sm text-gray-600">Base XP earned per workout</p>
                </div>
                <input
                  type="number"
                  defaultValue="50"
                  className="rounded border border-gray-300 px-3 py-2 w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">XP per Meal</h3>
                  <p className="text-sm text-gray-600">Base XP earned per logged meal</p>
                </div>
                <input
                  type="number"
                  defaultValue="10"
                  className="rounded border border-gray-300 px-3 py-2 w-32"
                />
              </div>
            </div>
          </section>

          {/* Leaderboard Settings */}
          <section className="rounded border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Leaderboard Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Weekly Reset Day</h3>
                  <p className="text-sm text-gray-600">Day of week to reset leaderboard</p>
                </div>
                <select className="rounded border border-gray-300 px-3 py-2 w-64">
                  <option value="1">Monday</option>
                  <option value="0">Sunday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
              Reset
            </button>
            <button className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
