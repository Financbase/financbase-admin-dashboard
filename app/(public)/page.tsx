export default function Home() {
  return (
    <div>
      {/* Ultra-minimal homepage for maximum performance */}
      <main>
        <section style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
          padding: '5rem 0',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '1.5rem',
              margin: '0 0 1.5rem 0'
            }}>
              Financbase
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              marginBottom: '2rem',
              margin: '0 0 2rem 0'
            }}>
              AI-Powered Financial Intelligence Platform
            </p>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              maxWidth: '42rem',
              margin: '0 auto 2rem auto'
            }}>
              Transform your financial operations with intelligent automation, real-time analytics, and predictive insights.
            </p>
          </div>
        </section>
        
        <section style={{
          padding: '5rem 0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '1.5rem',
              margin: '0 0 1.5rem 0'
            }}>
              AI-Powered Financial Intelligence
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              maxWidth: '42rem',
              margin: '0 auto 2rem auto'
            }}>
              Transform your financial operations with intelligent automation, real-time analytics, and predictive insights.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '2rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem',
                  margin: '0 0 0.5rem 0'
                }}>Real-time Analytics</h3>
                <p style={{
                  color: '#6b7280',
                  margin: '0'
                }}>Get instant insights into your financial performance</p>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem',
                  margin: '0 0 0.5rem 0'
                }}>AI Insights</h3>
                <p style={{
                  color: '#6b7280',
                  margin: '0'
                }}>Leverage machine learning for better decisions</p>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem',
                  margin: '0 0 0.5rem 0'
                }}>Automation</h3>
                <p style={{
                  color: '#6b7280',
                  margin: '0'
                }}>Streamline workflows and reduce manual work</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

