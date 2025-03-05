import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

const CIP = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const endpoint = id
      ? `http://localhost:3000/api/data/cip/${id}`
      : `http://localhost:3000/api/data/cip/all`;

    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
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

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      {id ? (
        <>
          <h1>
            {data?.data?.cip?.[0]?.['SOC Title'] || 'Job Title Not Available'}
            {' ('}
            {data?.data?.cip?.[0]?.['Educ Level'] || 'Educ Level Not Available'}
            {')'}
          </h1>
        </>
      ) : (
        <>
          <h1>All Jobs</h1>
          <ul>
            {/* Ensure data is an array before mapping */}
            {Array.isArray(data.data) && data.data.length > 0 ? (
              data.data.map((job, index) => (
                <li key={index}>
                  {job.title || 'Unknown Title'} ({job.code || 'Unknown Code'})
                </li>
              ))
            ) : (
              <li>No jobs available</li>
            )}
          </ul>
        </>
      )}
    </main>
  );
};

export default CIP;
