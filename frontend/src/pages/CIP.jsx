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
          allJobs.set(job['SOC Title'], { job, key }); // Store the key with the job
        }
      });
    }
  });

  return (
    <>
      <h1>
        {jobData['CIP Title'] || 'Job Title Not Available'} (
        {jobData['CIP Code'] || 'Job Code Not Available'}) -{' '}
        {jobData['Educ Level'] || 'Education Level Not Available'}
      </h1>

      {Array.from(allJobs.values()).map(({ job, key }, index) => (
        <div key={index}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3>
              {job['SOC Title'] || 'SOC Title Not Available'} (
              <a href={`http://localhost:5173/job/soc/${job['SOC Code']}`}>
                {job['SOC Code'] || 'N/A'}
              </a>
              )
            </h3>
            <button
              aria-label="Expand job details"
              onClick={() => toggleJobDetails(job['SOC Title'])}
            >
              {expandedJob === job['SOC Title'] ? '-' : '+'}
            </button>
          </nav>

          {expandedJob === job['SOC Title'] && (
            <section>
              <h4>{key} Data:</h4>
              {Object.entries(job).map(([jobKey, value]) => (
                <p key={jobKey}>
                  <strong>{jobKey}:</strong> {value || 'N/A'}
                </p>
              ))}
            </section>
          )}
        </div>
      ))}
    </>
  );
};

const JobList = ({ data }) => {
  const jobs = data.data;

  return (
    <main>
      <h1>All Jobs</h1>
      <aside>
        <ul>
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <li key={index}>
                {job.title || 'Unknown Title'}{' '}
                <a href={`http://localhost:5173/job/cip/${job.code}`}>
                  ({job.code || 'Unknown Code'})
                </a>
              </li>
            ))
          ) : (
            <li>No jobs available</li>
          )}
        </ul>
      </aside>
      <div></div>
    </main>
  );
};

export default CIP;
