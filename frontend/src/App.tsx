import './index.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <h1 className="text-4xl font-bold text-primary">Odoo Hackathon</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300">
        Frontend setup is complete.
      </p>

      <div className="flex gap-4">
        <button className="btn-primary">Primary Button</button>
        <button className="btn-secondary">Secondary Button</button>
      </div>

      <div className="card w-full max-w-md">
        <div className="card-header">
          <h2 className="card-title">Card Component</h2>
        </div>
        <div className="card-content space-y-4">
          <input className="input-field" placeholder="Input styles..." />
          <div className="flex items-center gap-2">
            <span className="loader"></span>
            <span>Loader...</span>
          </div>
        </div>
      </div>
      
      {/* Toast Placeholder */}
      <div className="toast">
        <p className="text-sm">This is a toast placeholder</p>
      </div>
    </div>
  )
}

export default App
