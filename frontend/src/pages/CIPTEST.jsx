import { useParams } from 'react-router';
import { useEffect, useState, useMemo } from 'react';

const fetchData = async (endpoint, setData, setLoading, setError) => {
  try {
    setLoading(true);
    setError(null);
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    setData(result);
  } catch (err) {
    setError(err.message);
    console.error('Fetch error:', err);
  } finally {
    setLoading(false);
  }
};

const CIP = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const endpoint = useMemo(() => {
    return id
      ? `http://localhost:3000/api/data/cip/${id}`
      : `http://localhost:3000/api/data/cip/all`;
  }, [id]);

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
  const [visibleSources, setVisibleSources] = useState({
    paIdol: true,
    wdaHpo: true,
    cip: true,
  });

  const toggleJobDetails = (jobTitle) => {
    setExpandedJob((prev) => (prev === jobTitle ? null : jobTitle));
  };

  const toggleSource = (source) => {
    setVisibleSources((prev) => ({
      ...prev,
      [source]: !prev[source],
    }));
  };

  // Create a map to group jobs by SOC Title
  const jobsBySocTitle = new Map();

  // Define the priority order of sources
  const sourcePriority = {
    paIdol: 1,
    wdaHpo: 2,
    cip: 3,
  };

  // Collect and group jobs from all available arrays
  ['cip', 'paIdol', 'wdaHpo'].forEach((key) => {
    if (jobs[key]) {
      jobs[key].forEach((job) => {
        const socTitle = job['SOC Title'];
        if (socTitle) {
          if (!jobsBySocTitle.has(socTitle)) {
            jobsBySocTitle.set(socTitle, []);
          }
          jobsBySocTitle.get(socTitle).push({ ...job, source: key });
        }
      });
    }
  });

  // Sort the entries within each SOC Title group by source priority
  jobsBySocTitle.forEach((entries, socTitle) => {
    jobsBySocTitle.set(
      socTitle,
      entries.sort(
        (a, b) => sourcePriority[a.source] - sourcePriority[b.source]
      )
    );
  });

  const getFirstValidSocCode = (entries) => {
    const entryWithCode = entries.find((entry) => entry['SOC Code']);
    return entryWithCode ? entryWithCode['SOC Code'] : 'N/A';
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          <span className="block text-gray-900">
            {jobData['CIP Title'] || 'Job Title Not Available'}
          </span>
          <span className="text-gray-600 text-xl">
            ({jobData['CIP Code'] || 'N/A'})
          </span>
          <span className="block text-gray-700 text-xl mt-2">
            {jobData['Educ Level'] || 'Education Level Not Available'}
          </span>
        </h1>

        {/* Source Toggle Buttons */}
        <div className="flex space-x-4 mt-4">
          {Object.entries(visibleSources).map(([source, isVisible]) => (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isVisible
                  ? source === 'paIdol'
                    ? 'bg-purple-100 text-purple-800'
                    : source === 'wdaHpo'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {source} {isVisible ? '✓' : '×'}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6">
        {Array.from(jobsBySocTitle.entries()).map(
          ([socTitle, jobEntries], index) => {
            // Filter entries based on visible sources
            const filteredEntries = jobEntries.filter(
              (job) => visibleSources[job.source]
            );

            // Skip this SOC Title if no entries are visible
            if (filteredEntries.length === 0) return null;

            return (
              <article
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {socTitle || 'SOC Title Not Available'}
                        <span className="text-gray-600 ml-2">
                          (
                          <a
                            href={`/job/soc/${getFirstValidSocCode(
                              jobEntries
                            )}`}
                            className="text-blue-600 hover:underline"
                          >
                            {getFirstValidSocCode(jobEntries)}
                          </a>
                          )
                        </span>
                      </h3>

                      {/* Table of job sources */}
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Source
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Occupation Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEntries.map((job, jIndex) => (
                              <>
                                <tr key={jIndex}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        job.source === 'paIdol'
                                          ? 'bg-purple-100 text-purple-800'
                                          : job.source === 'wdaHpo'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {job.source}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">
                                    {job['CIP Title'] ||
                                      job['SOC Title'] ||
                                      'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                      className="text-blue-600 hover:text-blue-800"
                                      onClick={() =>
                                        toggleJobDetails(
                                          `${socTitle}-${jIndex}`
                                        )
                                      }
                                      aria-expanded={
                                        expandedJob === `${socTitle}-${jIndex}`
                                      }
                                    >
                                      {expandedJob === `${socTitle}-${jIndex}`
                                        ? 'Hide Details'
                                        : 'Show Details'}
                                    </button>
                                  </td>
                                </tr>
                                {expandedJob === `${socTitle}-${jIndex}` && (
                                  <tr className="bg-gray-50">
                                    <td colSpan={3} className="px-6 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(job).map(
                                          ([jobKey, value]) =>
                                            jobKey !== 'source' && (
                                              <div
                                                className="space-y-1"
                                                key={jobKey}
                                              >
                                                <span className="block text-sm font-medium text-gray-500">
                                                  {jobKey}:
                                                </span>
                                                <span className="block text-gray-900">
                                                  {value || 'N/A'}
                                                </span>
                                              </div>
                                            )
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          }
        )}
      </div>
    </main>
  );
};

const JobList = ({ data }) => {
  const jobs = data.data;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">All CIP Jobs</h1>
      <div className="space-y-4">
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <article
                key={index}
                className="border border-gray-200 rounded-lg p-6 bg-white transition-all hover:shadow-md hover:-translate-y-1"
              >
                <h3 className="m-0">
                  <a
                    href={`/job/cip/${job.code}`}
                    className="no-underline text-current block"
                  >
                    <span className="block text-lg font-medium text-gray-900">
                      {job.title || 'Unknown Title'}
                    </span>
                    <span className="block text-sm text-gray-600 mt-2">
                      {job.code || 'Unknown Code'}
                    </span>
                  </a>
                </h3>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-600 border-2 border-dashed border-gray-200 rounded-lg">
            No jobs available
          </div>
        )}
      </div>
    </main>
  );
};

export default CIP;
