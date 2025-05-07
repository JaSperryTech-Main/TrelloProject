import { useParams } from 'react-router';
import { useEffect, useState } from 'react';

const SOC = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const endpoint = id
      ? `${import.meta.env.VITE_BACKEND_URL}/data/soc/${id}`
      : `${import.meta.env.VITE_BACKEND_URL}/data/soc/all`;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-4 p-8 text-gray-700 text-lg">
        <div className="w-6 h-6 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8 text-center">
        ⚠️ Error: {error}
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl min-h-[80vh]">
      {id ? (
        <div className="detail-view">
          <header className="mb-8 pb-6 border-b-2 border-gray-200">
            <h1 className="text-3xl m-0 leading-tight">
              <span className="block text-indigo-900 mb-2">
                {data?.data?.cip?.[0]?.['CIP Title'] ||
                  'Job Title Not Available'}
              </span>
              <span className="text-xl text-gray-600">
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
          <h1 className="text-3xl text-indigo-900 mb-8">All SOC Jobs</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(data.data) && data.data.length > 0 ? (
              data.data.map((job, index) => (
                <a
                  key={index}
                  href={`job/soc/${job.code}`}
                  className="no-underline text-current"
                >
                  <article className="border border-gray-200 rounded-lg p-6 bg-white transition-all hover:shadow-md hover:-translate-y-1">
                    <h3 className="m-0">
                      <span className="block text-gray-800 mb-1">
                        {job.title || 'Unknown Title'}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {job.code || 'Unknown Code'}
                      </span>
                    </h3>
                  </article>
                </a>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg col-span-full">
                No jobs available
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default SOC;
