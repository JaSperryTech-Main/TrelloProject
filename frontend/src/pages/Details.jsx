import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Use 'react-router-dom' for newer versions of React Router

const Details = () => {
  const { id } = useParams(); // Get the 'id' from the URL params
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); // To manage loading state
  const [error, setError] = useState(null); // For handling errors

  useEffect(() => {
    const getFileFromAPI = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/files/${id}`);

        if (!response.ok) {
          throw new Error('Item not found');
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message); // Set error if any occurs during the fetch
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    getFileFromAPI(); // Call the function to fetch data
  }, [id]); // Run this effect when the 'id' changes

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
      {/* Display the raw JSON */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
};

export default Details;
