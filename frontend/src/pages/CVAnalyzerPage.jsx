import { useState } from 'react'
import TopNav from '../components/TopNav'

export default function CVAnalyzerPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer")
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedFixes, setCompletedFixes] = useState([])
  const [file, setFile] = useState(null)
  const [targetCountries, setTargetCountries] = useState("")
  const [relocateAnywhere, setRelocateAnywhere] = useState(false)

  const ANALYSIS_STEPS = [
    "Initializing Neural Engine...",
    "Extracting Semantic Content...",
    "Comparing against Target JD...",
    "Auditing Skills & Experience...",
    "Identifying Strategic Red Flags...",
    "Finalizing Performance Report..."
  ]

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) setFile(selectedFile)
  }

  const handleFileUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setCurrentStep(0)

    // Simulate progress steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev))
    }, 1200)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_title', jobTitle)
    formData.append('target_countries', targetCountries)
    formData.append('relocate_anywhere', relocateAnywhere)

    try {
      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Analysis failed. Make sure the backend is running.")
      }
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      clearInterval(stepInterval)
    }
  }

  const toggleFix = (index) => {
    setCompletedFixes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const exportPDF = () => {
    window.print()
  }

  return (
    <div className="app-shell">
      <TopNav />
      <div className="hero-banner"></div>

      <div className="page-wrapper">
        <div className="flex justify-between items-center mb-6">
          <h1 style={{ fontSize: '28px' }}>CV Analyzer</h1>
        </div>

        <div className="card mb-6" style={{ padding: '48px', textAlign: 'center', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          {!results && !loading && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Upload Resume for Analysis</h2>
              <p className="text-muted" style={{ marginBottom: '32px' }}>Receive an elite, deterministic ATS audit and actionable upskilling steps.</p>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label className="form-label">Target Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="form-input"
                  placeholder="Enter Target Job Title..."
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label className="form-label">Target Countries (comma separated)</label>
                <input
                  type="text"
                  value={targetCountries}
                  onChange={(e) => setTargetCountries(e.target.value)}
                  className="form-input"
                  placeholder="e.g. UAE, UK, Singapore"
                  disabled={relocateAnywhere}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--text)' }}>
                   <input type="checkbox" checked={relocateAnywhere} onChange={e => setRelocateAnywhere(e.target.checked)} />
                   Anywhere (Ready to Relocate)
                </label>
              </div>

              {error && <div style={{ color: 'var(--error)', marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>{error}</div>}

              <div
                style={{
                  border: file ? '1px solid var(--border-strong)' : '1px dashed var(--border-strong)',
                  padding: '40px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: file ? 'var(--surface)' : '#fafafa',
                  transition: 'all var(--transition)',
                  textAlign: 'center',
                  marginBottom: '24px'
                }}
                onClick={!file ? () => document.getElementById('fileInput').click() : undefined}
              >
                <input type="file" id="fileInput" hidden accept=".pdf,.docx" onChange={handleFileChange} />
                
                {!file ? (
                  <>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                    <h3 style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '16px' }}>Click to Upload Resume (PDF, DOCX)</h3>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '15px' }}>
                      Selected: {file.name}
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Change file
                    </div>
                  </div>
                )}
              </div>

              {file && (
                <div style={{ marginTop: '32px' }}>
                   <button 
                    onClick={handleFileUpload} 
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', height: '56px', fontSize: '16px', borderRadius: '12px' }}
                  >
                    Analyze Resume
                  </button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div style={{ padding: '60px 0' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>{ANALYSIS_STEPS[currentStep]}</h3>
                <div style={{ width: '300px', height: '4px', background: 'var(--border)', margin: '0 auto', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%`, 
                    height: '100%', 
                    background: 'var(--primary)', 
                    transition: 'width 0.8s ease' 
                  }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {results && (
          <div className="printable-report">
            <style>{`
              @media print {
                .app-shell > *:not(.page-wrapper), 
                .hero-banner, 
                .btn-ghost, 
                .action-buttons,
                .top-nav { display: none !important; }
                .page-wrapper { padding: 0 !important; margin: 0 !important; }
                .card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
                body { background: white !important; }
                .printable-report { padding: 20px; }
              }
            `}</style>

            <div className="flex justify-between items-center mb-6 action-buttons">
              <button onClick={() => setResults(null)} className="btn btn-ghost">← New Analysis</button>
              <div className="flex gap-3">
                <button onClick={exportPDF} className="btn btn-secondary">
                  Export PDF
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }} className="gap-6 mb-6">
              {/* Profile Card */}
              <div className="card" style={{ border: 'none' }}>
                <div className="section-hd" style={{ marginBottom: '16px' }}>
                  <h3 style={{ color: 'var(--text-muted)' }}>Candidate Profile</h3>
                  <h2 style={{ fontSize: '24px' }}>{results.candidate_metadata?.name || 'Unknown'}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Email:</strong><br/>{results.candidate_metadata?.email}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Current Role:</strong><br/>{results.candidate_metadata?.current_title}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Experience:</strong><br/>{results.candidate_metadata?.total_years_exp} years ({results.candidate_metadata?.relevant_years_exp} relevant)</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Location:</strong><br/>{results.candidate_metadata?.detected_country}</div>
                </div>
              </div>

              {/* Score Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', border: 'none' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', opacity: 0.8 }}>ATS Score</div>
                <div style={{ fontSize: '56px', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.02em' }}>{results.overall_ats_score}<span style={{ fontSize: '20px', opacity: 0.5 }}>/100</span></div>
              </div>
            </div>

            <div className="card mb-6" style={{ border: 'none' }}>
              <div className="section-hd" style={{ marginBottom: 0 }}>
                <h3 style={{ color: 'var(--text-muted)' }}>Professional Summary & Fit</h3>
                <h2 style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: '400', marginTop: '12px' }}>{results.suggested_summary}</h2>
                {results.candidate_metadata?.target_region_fit && (
                  <p style={{ marginTop: '16px', fontSize: '14px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}><strong>Region Fit:</strong> {results.candidate_metadata.target_region_fit}</p>
                )}
              </div>
            </div>

            {/* Sectional Report */}
            {results.sectional_report && (
              <div className="mb-6">
                <h3 className="mb-4" style={{ fontSize: '20px', letterSpacing: '-0.01em' }}>Detailed Sectional Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  
                  {/* Keyword Analysis */}
                  <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>Keyword Similarity</h4>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{results.sectional_report.keyword_analysis?.score}/100</div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text)' }}>{results.sectional_report.keyword_analysis?.feedback}</p>
                    {results.sectional_report.keyword_analysis?.actionable_fix && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Actionable Fix</div>
                        <div style={{ fontSize: '13px' }}>{results.sectional_report.keyword_analysis.actionable_fix}</div>
                      </div>
                    )}
                  </div>

                  {/* Skills Audit */}
                  <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>Skills Match</h4>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{results.sectional_report.skills_audit?.score}/100</div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text)' }}>{results.sectional_report.skills_audit?.feedback}</p>
                    {results.sectional_report.skills_audit?.missing_skills && results.sectional_report.skills_audit.missing_skills.length > 0 && (
                      <div style={{ marginTop: '12px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--error)' }}><strong>Missing:</strong> {results.sectional_report.skills_audit.missing_skills.join(', ')}</span>
                      </div>
                    )}
                    {results.sectional_report.skills_audit?.priority_skill_to_add && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Priority Skill to Add</div>
                        <div style={{ fontSize: '13px' }}>{results.sectional_report.skills_audit.priority_skill_to_add}</div>
                      </div>
                    )}
                  </div>

                  {/* Experience Logic */}
                  <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>Experience Relevance</h4>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{results.sectional_report.experience_logic?.score}/100</div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text)' }}>{results.sectional_report.experience_logic?.relevance_summary}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>{results.sectional_report.experience_logic?.feedback}</p>
                    {results.sectional_report.experience_logic?.quantification_hack && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Quantification Hack</div>
                        <div style={{ fontSize: '13px' }}>{results.sectional_report.experience_logic.quantification_hack}</div>
                      </div>
                    )}
                  </div>

                  {/* Formatting & Structure */}
                  <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>Formatting & Structure</h4>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{results.sectional_report.formatting_structure?.score}/100</div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text)' }}><strong>Pattern:</strong> {results.sectional_report.formatting_structure?.pattern_detected}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>{results.sectional_report.formatting_structure?.structural_advice}</p>
                    {results.sectional_report.formatting_structure?.layout_optimization && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Layout Optimization</div>
                        <div style={{ fontSize: '13px' }}>{results.sectional_report.formatting_structure.layout_optimization}</div>
                      </div>
                    )}
                  </div>

                  {/* Achievements & Impact */}
                  {results.sectional_report.achievements_impact && (
                    <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>Achievements & Impact</h4>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{results.sectional_report.achievements_impact.score}/100</div>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text)' }}>{results.sectional_report.achievements_impact.feedback}</p>
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {results.sectional_report.achievements_impact.detected_achievements?.map((ach, i) => (
                          <span key={i} style={{ fontSize: '11px', background: '#f5f5f5', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-muted)' }}>{ach}</span>
                        ))}
                      </div>
                      {results.sectional_report.achievements_impact.impact_multiplier_advice && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Impact Multiplier Advice</div>
                          <div style={{ fontSize: '13px' }}>{results.sectional_report.achievements_impact.impact_multiplier_advice}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Market Benchmarking */}
                  {results.market_benchmarking && (
                    <div className="card" style={{ padding: '24px', border: '1px solid var(--border-strong)', boxShadow: 'none', background: '#fafafa' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', marginBottom: '20px' }}>Market Competitiveness</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Percentile</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>Top {100 - results.market_benchmarking.percentile}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Market Demand</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: results.market_benchmarking.market_demand?.toLowerCase().includes('high') ? 'var(--success)' : 'var(--text)' }}>
                            {results.market_benchmarking.market_demand}
                          </div>
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '4px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>
                            Est. Salary ({results.market_benchmarking?.target_market_used || results.candidate_metadata?.detected_country || 'Target Region'})
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em' }}>{results.market_benchmarking.salary_estimate}</div>
                          {results.sectional_report.market_benchmarking?.regional_positioning_strategy && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                              <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Regional Strategy</div>
                              <div style={{ fontSize: '13px' }}>{results.sectional_report.market_benchmarking.regional_positioning_strategy}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }} className="mb-6 gap-6">
              {/* Red Flags */}
              <div className="card" style={{ border: 'none' }}>
                <div className="section-hd" style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--error)' }}>Areas of Weakness</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {results.red_flags?.map((flag, i) => (
                    <div key={i} style={{ padding: '16px', background: '#fffafa', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                      <strong style={{ color: '#b91c1c', display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                        {flag.type || flag.title || 'Red Flag'}
                      </strong>
                      <span style={{ color: '#991b1b', fontSize: '13px' }}>
                        {flag.description || flag.feedback || 'Warning detected in resume structure or content.'}
                      </span>
                    </div>
                  ))}
                  {(!results.red_flags || results.red_flags.length === 0) && <p className="text-muted" style={{ padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>No areas of weakness found. Great job!</p>}
                </div>
              </div>

              {/* General Career Improvements */}
              <div className="card" style={{ border: 'none' }}>
                <div className="section-hd" style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--primary)' }}>Actionable Improvements</h3>
                  <p className="text-muted text-sm" style={{ marginTop: '4px' }}>Strategic checklist to elevate your profile.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {results.general_career_improvements?.map((item, i) => {
                    const isDone = completedFixes.includes(i)
                    return (
                      <div 
                        key={i} 
                        onClick={() => toggleFix(i)}
                        style={{ 
                          padding: '16px', 
                          background: isDone ? '#fafafa' : '#ffffff', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: `1px solid ${isDone ? 'var(--border)' : 'var(--border-strong)'}`,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          gap: '16px',
                          opacity: isDone ? 0.6 : 1
                        }}
                      >
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '6px', 
                          border: `1px solid ${isDone ? 'var(--text)' : 'var(--border-strong)'}`,
                          background: isDone ? 'var(--text)' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {isDone && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600', marginBottom: '4px', textDecoration: isDone ? 'line-through' : 'none' }}>
                            {item.category}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.insight}</div>
                          <div style={{ fontSize: '13px', background: '#fafafa', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text)' }}>Action:</span> {item.action_step}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {(!results.general_career_improvements || results.general_career_improvements.length === 0) && <p className="text-muted" style={{ padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>No major improvements identified.</p>}
                </div>
              </div>
            </div>

            {/* Courses */}
            {results.suggested_courses && results.suggested_courses.length > 0 && (
              <div className="card mb-6" style={{ border: 'none' }}>
                <div className="section-hd" style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--text-muted)' }}>Recommended Upskilling</h3>
                  <h2 style={{ fontSize: '20px', marginTop: '4px' }}>Targeted Courses</h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {results.suggested_courses.map((course, i) => (
                    course.url ? (
                      <a key={i} href={course.url} target="_blank" rel="noreferrer" style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: '#fafafa',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '30px',
                        color: 'var(--text)',
                        fontSize: '14px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                       }}
                       onMouseOver={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                       onMouseOut={(e) => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.transform = 'translateY(0)'; }}
                       >
                        {course.name || course}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                      </a>
                    ) : (
                      <div key={i} style={{ 
                        display: 'inline-flex',
                        padding: '12px 20px',
                        background: '#fafafa',
                        border: '1px solid var(--border)',
                        borderRadius: '30px',
                        color: 'var(--text-muted)',
                        fontSize: '14px',
                        fontWeight: '500'
                       }}>{course.name || course}</div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Interview Prep Section */}
            {results.interview_prep && results.interview_prep.length > 0 && (
              <div className="mb-6">
                 <h3 className="mb-4" style={{ fontSize: '20px', letterSpacing: '-0.01em' }}>AI Interview Preparation</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                    {results.interview_prep.map((item, i) => (
                      <div key={i} className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'none' }}>
                        <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '16px' }}>Q: {item.question}</div>
                        <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Interview Intent</div>
                          <div style={{ fontSize: '13px', color: 'var(--text)' }}>{item.intent}</div>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                           <strong style={{ display: 'block', marginBottom: '6px' }}>Suggested Strategy:</strong> 
                           <span style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.suggested_answer}</span>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
