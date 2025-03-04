import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

const Job = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/data/soc/${id}`
        ); // Replace with real API
        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p>Error: {error}</p>;

  const similarJobs = job.data.cip;

  return (
    <main>
      <h1>
        {job?.data?.wdaHpo?.['SOC Title'] || 'Job Title Not Available'},{' '}
        {job?.data?.wdaHpo?.['Educational Attainment'] ||
          'Job Educational Attainment Not Available'}
      </h1>
      <aside>
        <h2>Similar Jobs</h2>
        <ul>
          {similarJobs.length > 0 ? (
            similarJobs.map((similarJob) => (
              <li key={similarJob['CIP Title']}>{similarJob['CIP Title']}</li>
            ))
          ) : (
            <li>No similar jobs found</li>
          )}
        </ul>
      </aside>
    </main>
  );
};

export default Job;
