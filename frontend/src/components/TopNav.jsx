export default function TopNav() {
  return (
    <div className="top-nav">
      <div className="logo" style={{ userSelect: 'none' }}>
        CV<span>Analyzer</span>
      </div>
      
      <div className="nav-links">
        <button className="active">
          Resume ATS Scoring & AI Feedback
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
            AI
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>Gemini Local Mode</span>
        </div>
      </div>
    </div>
  )
}
