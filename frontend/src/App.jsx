import { useEffect, useState } from 'react'
import './App.css'

const API_URL = `${'http://localhost:5000'}/api/feedback`

const routeFromHash = () => {
  const route = window.location.hash.replace(/^#\/?/, '')
  if (!route) return { page: 'dashboard' }
  if (route === 'add-feedback') return { page: 'form' }
  if (route.startsWith('edit/')) return { page: 'form', id: route.slice(5) }
  return { page: 'dashboard' }
}

const getRatingLabel = (rating) => {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 3.5) return 'Good'
  if (rating >= 2.5) return 'Average'
  return 'Needs attention'
}

function App() {
  const [route, setRoute] = useState(routeFromHash)
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const updateRoute = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true)
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Could not load feedback. Check that the API is running.')
        setFeedback(await response.json())
        setError('')
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [refreshKey])

  const averageRating = feedback.length
    ? feedback.reduce((total, item) => total + Number(item.feedback_rating || 0), 0) / feedback.length
    : 0
  const filteredFeedback = feedback.filter((item) =>
    `${item.course_name} ${item.course_id} ${item.feedback_comments}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const deleteFeedback = async (item) => {
    if (!window.confirm(`Delete feedback for ${item.course_name}? This cannot be undone.`)) return
    try {
      const response = await fetch(`${API_URL}/${item._id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete this feedback.')
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 id="test">feedback</h1>
        
        <nav className="primary-nav" aria-label="Main navigation">
          <a className={route.page === 'dashboard' ? 'nav-link active' : 'nav-link'} href="#/">
            <span className="nav-icon" aria-hidden="true"></span>Dashboard
          </a>
          <a className={route.page === 'form' && !route.id ? 'nav-link active' : 'nav-link'} href="#/add-feedback">
            <span className="nav-icon plus-icon" aria-hidden="true"></span>Add Feedback
          </a>
        </nav>
        
       
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {route.page === 'form' ? (route.id ? 'Edit feedback' : 'Add feedback') : 'Dashboard'}</div>
          <div className="admin-chip"><span className="admin-avatar">A</span><span>Admin view</span></div>
        </header>

        {route.page === 'form' ? (
          <FeedbackForm
            key={route.id ? `${route.id}-${loading ? 'loading' : feedback.some((item) => item._id === route.id) ? 'loaded' : 'missing'}` : 'new'}
            id={route.id}
            feedback={feedback}
            loading={loading}
            onSaved={() => {
              setRefreshKey((key) => key + 1)
              window.location.hash = '#/'
            }}
          />
        ) : (
          <section className="page-content">
            <div className="page-heading">
              <div>
                
                <h1 id="gg">Feedback dashboard</h1>
              
              </div>
              <a className="button button-primary" href="#/add-feedback"><span aria-hidden="true">＋</span> Add feedback</a>
            </div>

            <div className="stats-grid">
              <article className="stat-panel stat-total">
                <div className="stat-topline"><span>responses</span><span className="stat-symbol">↗</span></div>
                <div className="stat-value">{feedback.length.toString().padStart(2, '0')}</div>
                <div className="stat-foot">Across all courses</div>
              </article>
              <article className="stat-panel stat-rating">
                <div className="stat-topline"><span> ratings Average</span></div>
                <div className="stat-value">{averageRating.toFixed(1)}<span className="stat-denominator"> / 5</span></div>
                
              </article>
              <article className="stat-panel stat-courses">
                <div className="stat-topline"><span> reviewed</span><span className="stat-symbol"></span></div>
                <div className="stat-value">{new Set(feedback.map((item) => item.course_name)).size.toString().padStart(2, '0')}</div>
              
              </article>
            </div>

            <section className="feedback-section">
              <div className="section-heading">
                <div>
                  <h2>Course feedback</h2>
                  <p>Review ratings </p>
                </div>
                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses" aria-label="Search courses" />
                  <kbd>/</kbd>
                </label>
              </div>

              {error && <div className="alert" role="alert">{error}</div>}
              {loading ? (
                <div className="empty-state">Loading feedbacks…</div>
              ) : filteredFeedback.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>COURSE ID</th><th>COURSE</th><th>DURATION</th><th>RATING</th><th>FEEDBACK</th><th><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {filteredFeedback.map((item) => (
                        <tr key={item._id}>
                          <td><span className="course-id">{item.course_id ?? item._id.slice(-6).toUpperCase()}</span></td>
                          <td><span className="course-name">{item.course_name}</span><span className="course-subtitle">Learning program</span></td>
                          <td><span className="duration-label">{item.course_duration || 'Self-paced'}</span></td>
                          <td><span className="rating-cell">{Number(item.feedback_rating).toFixed(1)}<span className="rating-outof">/5</span></span><span className="rating-label">{getRatingLabel(Number(item.feedback_rating))}</span></td>
                          <td><span className="comment-preview" title={item.feedback_comments}>{item.feedback_comments}</span></td>
                          <td><div className="row-actions"><a className="icon-button" href={`#/edit/${item._id}`} aria-label={`Edit ${item.course_name}`} title="Edit feedback">↗</a><button className="icon-button delete-button" type="button" onClick={() => deleteFeedback(item)} aria-label={`Delete ${item.course_name}`} title="Delete feedback">×</button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
            
                
                  {!search && <a className="button button-primary" href="#/add-feedback">Add feedback <span aria-hidden="true">→</span></a>}
                </div>
              )}  
              
            </section>
            
          </section>
        )}
      </main>
    </div>
  )
}

function FeedbackForm({ id, feedback, loading, onSaved }) {
  const current = feedback.find((item) => item._id === id)
  const [form, setForm] = useState(() => ({
    course_name: current?.course_name || '',
    feedback_comments: current?.feedback_comments || '',
    feedback_rating: String(current?.feedback_rating ?? 5),
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateField = (event) => setForm((existing) => ({ ...existing, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, feedback_rating: Number(form.feedback_rating) }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save this feedback.')
      onSaved()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-content form-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FEEDBACK MANAGEMENT</p>
          <h1 id="nn">{id ? 'Edit feedback' : 'Add feedback'}</h1>
          
        </div>
        <a className="button button-secondary" href=""> Back to dashboard</a>
      </div>
      {!current && id && loading ? <div className="empty-state">Loading feedback…</div> : !current && id ? <div className="alert" role="alert">This feedback could not be found. <a href="#/">Return to dashboard</a></div> : (
        <form className="feedback-form" onSubmit={submit}>
          
          {error && <div className="alert" role="alert">{error}</div>}
          <div className="form-field">
            <label htmlFor="course_name">Course name <span>*</span></label>
            <input id="course_name" name="course_name" value={form.course_name} onChange={updateField}  minLength="3" maxLength="120" required />
          </div>
          <div className="form-field">
            <label htmlFor="feedback_comments">Feedback comments <span>*</span></label>
            <textarea id="feedback_comments" name="feedback_comments" value={form.feedback_comments} onChange={updateField}  rows="5" maxLength="2000" required />
            
          </div>
          <fieldset className="form-field rating-field">
            <legend>Feedback rating <span>*</span></legend>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label className={Number(form.feedback_rating) === rating ? 'rating-option selected' : 'rating-option'} key={rating}>
                  <input type="radio" name="feedback_rating" value={rating} checked={Number(form.feedback_rating) === rating} onChange={updateField} />
                  <span className="option-star"></span><span>{rating}</span>
                </label>
              ))}
            </div>
            <span className="field-hint">{getRatingLabel(Number(form.feedback_rating))} · {form.feedback_rating} out of 5</span>
          </fieldset>
          {id && current && <div className="record-note">Course ID <strong>{current.course_id ?? current._id.slice(-6).toUpperCase()}</strong><span>·</span> Duration <strong>{current.course_duration || 'Self-paced'}</strong></div>}
          <div className="form-actions"><a href="#/" className="button button-secondary">Cancel</a><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Add feedback'} <span aria-hidden="true">→</span></button></div>
        </form>
      )}
    </section>
  )
}

export default App