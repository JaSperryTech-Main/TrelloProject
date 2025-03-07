import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

const SOC = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const endpoint = id
      ? `http://localhost:3000/api/data/soc/${id}`
      : `http://localhost:3000/api/data/soc/all`;

    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        Loading...
      </div>
    );

  if (error) return <div className="error-state">⚠️ Error: {error}</div>;

  return (
    <main className="container">
      {id ? (
        <div className="detail-view">
          <header className="detail-header">
            <h1 className="detail-title">
              <span className="title-main">
                {data?.data?.cip?.[0]?.['CIP Title'] ||
                  'Job Title Not Available'}
              </span>
              <span className="title-meta">
                (
                {data?.data?.cip?.[0]?.['Educ Level'] ||
                  'Education Level Not Available'}
                )
              </span>
            </h1>
          </header>
        </div>
      ) : (
        <div className="list-view">
          <h1 className="list-title">All SOC Jobs</h1>
          <div className="grid-list">
            {Array.isArray(data.data) && data.data.length > 0 ? (
              data.data.map((job, index) => (
                <a
                  key={index}
                  href={`http://localhost:5173/job/soc/${job.code}`}
                  className="job-card-link"
                >
                  <article className="job-card">
                    <h3 className="job-title">
                      <span className="title-text">
                        {job.title || 'Unknown Title'}
                      </span>
                      <span className="title-code">
                        {job.code || 'Unknown Code'}
                      </span>
                    </h3>
                  </article>
                </a>
              ))
            ) : (
              <div className="empty-state">No jobs available</div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 80vh;
        }

        /* Loading and Error States */
        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
          color: #4a5568;
          font-size: 1.2rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e2e8f0;
          border-top-color: #4299e1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-state {
          padding: 2rem;
          color: #dc2626;
          background: #fef2f2;
          border-radius: 0.5rem;
          margin: 2rem;
          text-align: center;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Detail View */
        .detail-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .detail-title {
          font-size: 2rem;
          margin: 0;
          line-height: 1.3;
        }

        .title-main {
          display: block;
          color: #1a237e;
          margin-bottom: 0.5rem;
        }

        .title-meta {
          font-size: 1.25rem;
          color: #4a5568;
        }

        /* List View */
        .list-title {
          font-size: 2rem;
          color: #1a237e;
          margin-bottom: 2rem;
        }

        .grid-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .job-card-link {
          text-decoration: none;
          color: inherit;
        }

        .job-card {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          background: white;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .job-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .job-title {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.4;
        }

        .title-text {
          display: block;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .title-code {
          display: block;
          font-size: 0.9rem;
          color: #718096;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #718096;
          border: 2px dashed #e2e8f0;
          border-radius: 0.5rem;
          grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .detail-title {
            font-size: 1.5rem;
          }

          .title-meta {
            font-size: 1rem;
          }

          .list-title {
            font-size: 1.5rem;
          }

          .grid-list {
            grid-template-columns: 1fr;
          }

          .job-card {
            padding: 1rem;
          }
        }
      `}</style>
    </main>
  );
};

export default SOC;
