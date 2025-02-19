import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import withLocation from "../../services/withLocation";
import getDataFromSource from "../../services/getDataFromSource";

// Create a context for the record data
export const RecordContext = React.createContext();

const RecordNotWrapped = ({ search, children }) => {
  const { query } = search; // Decodifica il parametro `query` dall'URL
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Decodifica il parametro `query`
        const queryObject = query ? JSON.parse(decodeURIComponent(query)) : null;

        if (!queryObject || !queryObject.dTable || !queryObject.fields) {
          throw new Error("Invalid query parameter. `dTable` and `fields` are required.");
        }

        // Recupera i dati usando `getDataFromSource`
        const data = await getDataFromSource({
          dEndPoint: process.env.GATSBY_DIRECTUS_ENDPOINT,
          dTable: queryObject.dTable,
          dQueryString: `fields=${queryObject.fields}&filter=${encodeURIComponent(
            JSON.stringify(queryObject.filter || {})
          )}`,
          transType: "json",
        });

        setRecordData(data); // Setta i dati recuperati
      } catch (err) {
        setError(err); // Gestisce gli errori
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Esegue il fetch
  }, [query]);

  if (loading) {
    return <div className="text-info">Loading...</div>;
  }

  if (error) {
    console.error(error);
    return (
      <div className="text-danger">
        {error.message}
        <br />
        More info in the console log
      </div>
    );
  }

  if (!recordData || recordData.length === 0) {
    return <div className="text-warning">No result found</div>;
  }

  return (
    <RecordContext.Provider value={recordData}>
      {children}
    </RecordContext.Provider>
  );
};

const Record = withLocation(RecordNotWrapped);

Record.propTypes = {
  search: PropTypes.shape({
    query: PropTypes.string.isRequired, // Expecting a `query` parameter
  }).isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element])
    .isRequired,
};

export { Record };
