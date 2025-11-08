export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your Carve Wiki dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold mb-2">Health Stats</h3>
          <p className="text-sm text-gray-600">Track your health metrics</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold mb-2">Workout Progress</h3>
          <p className="text-sm text-gray-600">Monitor your fitness journey</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold mb-2">Nutrition</h3>
          <p className="text-sm text-gray-600">View your meal plans</p>
        </div>
      </div>
    </div>
  );
}
