import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

const fetchData = async (endpoint, setData, setLoading, setError) => {
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

const CIP = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const endpoint = id
    ? `http://localhost:3000/api/data/cip/${id}`
    : `http://localhost:3000/api/data/cip/all`;

  useEffect(() => {
    fetchData(endpoint, setData, setLoading, setError);
  }, [id, endpoint]);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      {id ? <JobDetails data={data} cipCode={id} /> : <JobList data={data} />}
    </main>
  );
};

const JobDetails = ({ data, cipCode }) => {
  const jobs = data?.data || {};
  const jobData = jobs?.cip?.find((item) => item['CIP Code'] === cipCode) || {};

  const [expandedJob, setExpandedJob] = useState(null);

  const toggleJobDetails = (jobTitle) => {
    setExpandedJob((prev) => (prev === jobTitle ? null : jobTitle));
  };

  const allJobs = new Map();

  // Collect unique jobs from all available arrays
  ['cip', 'paIdol', 'wdaHpo'].forEach((key) => {
    if (jobs[key]) {
      jobs[key].forEach((job) => {
        if (job['SOC Title']) {
          allJobs.set(job['SOC Title'], { job, key });
        }
      });
    }
  });

  return (
    <main className="container">
      <header className="job-header">
        <h1>
          <span className="title-main">
            {jobData['CIP Title'] || 'Job Title Not Available'}
          </span>
          <span className="title-code">({jobData['CIP Code'] || 'N/A'})</span>
          <span className="title-education">
            {jobData['Educ Level'] || 'Education Level Not Available'}
          </span>
        </h1>
      </header>

      <div className="job-list">
        {Array.from(allJobs.values()).map(({ job, key }, index) => (
          <article key={index} className="job-card">
            <div className="job-summary">
              <div className="job-title-group">
                <h3 className="job-title">
                  {job['SOC Title'] || 'SOC Title Not Available'}
                  <span className="job-code">
                    (
                    <a
                      href={`http://localhost:5173/job/soc/${job['SOC Code']}`}
                    >
                      {job['SOC Code'] || 'N/A'}
                    </a>
                    )
                  </span>
                </h3>
                <span className="data-source">{key}</span>
              </div>
              <button
                className="toggle-button"
                onClick={() => toggleJobDetails(job['SOC Title'])}
                aria-expanded={expandedJob === job['SOC Title']}
              >
                {expandedJob === job['SOC Title'] ? '−' : '+'}
              </button>
            </div>

            {expandedJob === job['SOC Title'] && (
              <div className="job-details">
                <div className="detail-grid">
                  {Object.entries(job).map(([jobKey, value]) => (
                    <div className="detail-item" key={jobKey}>
                      <span className="detail-label">{jobKey}:</span>
                      <span className="detail-value">{value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .job-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #eee;
        }

        .title-main {
          display: block;
          font-size: 2rem;
          color: #1a237e;
          margin-bottom: 0.5rem;
        }

        .title-code {
          font-size: 1.5rem;
          color: #4a5568;
          margin-right: 1rem;
        }

        .title-education {
          font-size: 1.2rem;
          color: #718096;
        }

        .job-list {
          display: grid;
          gap: 1.5rem;
        }

        .job-card {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .job-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .job-summary:hover {
          background-color: #f8fafc;
        }

        .job-title-group {
          flex-grow: 1;
        }

        .job-title {
          font-size: 1.25rem;
          margin: 0;
          color: #2d3748;
        }

        .job-code a {
          color: #4299e1;
          text-decoration: none;
          font-weight: 500;
        }

        .job-code a:hover {
          text-decoration: underline;
        }

        .data-source {
          display: inline-block;
          font-size: 0.875rem;
          color: #718096;
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          margin-top: 0.5rem;
        }

        .toggle-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-button:hover {
          background-color: #edf2f7;
          color: #2d3748;
        }

        .job-details {
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
        }

        .detail-label {
          font-weight: 600;
          color: #4a5568;
        }

        .detail-value {
          color: #718096;
          max-width: 60%;
          text-align: right;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .title-main {
            font-size: 1.5rem;
          }

          .title-code {
            font-size: 1.2rem;
          }

          .job-summary {
            padding: 1rem;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
};

const JobList = ({ data }) => {
  const jobs = data.data;

  return (
    <main className="container">
      <h1 className="list-title">All CIP Jobs</h1>
      <div className="list-container">
        {jobs.length > 0 ? (
          <div className="grid-list">
            {jobs.map((job, index) => (
              <article key={index} className="list-item">
                <h3 className="item-title">
                  <a
                    href={`http://localhost:5173/job/cip/${job.code}`}
                    className="item-link"
                  >
                    {job.title || 'Unknown Title'}
                    <span className="item-code">
                      {job.code || 'Unknown Code'}
                    </span>
                  </a>
                </h3>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">No jobs available</div>
        )}
      </div>

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

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

        .list-item {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
          background: white;
        }

        .list-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .item-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .item-title {
          margin: 0;
          font-size: 1.1rem;
          color: #2d3748;
        }

        .item-code {
          display: block;
          font-size: 0.9rem;
          color: #718096;
          margin-top: 0.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #718096;
          border: 2px dashed #e2e8f0;
          border-radius: 0.5rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .list-title {
            font-size: 1.5rem;
          }

          .grid-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
};

export default CIP;
