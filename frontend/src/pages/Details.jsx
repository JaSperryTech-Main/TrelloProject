import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const Details = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getFileFromAPI = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/files/${id}`
        );

        if (!response.ok) {
          throw new Error('Item not found');
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getFileFromAPI();
  }, [id]);

  // Display loading state or error if applicable
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main>
      <h1>Details for Item {id}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
};

export default Details;
