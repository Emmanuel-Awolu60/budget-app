const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">
          Welcome to BudgetMate
        </h1>
        <p className="text-gray-600">Track your income and expenses easily.</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Balance</h2>
          <p className="text-2xl font-bold text-green-600 mt-2">₦0.00</p>
        </div>

        {/* Income */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Income</h2>
          <p className="text-2xl font-bold text-blue-500 mt-2">₦0.00</p>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Expenses</h2>
          <p className="text-2xl font-bold text-red-500 mt-2">₦0.00</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
