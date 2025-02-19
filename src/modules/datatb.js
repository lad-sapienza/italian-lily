import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import getDataFromSource from "../services/getDataFromSource";
import PropTypes from "prop-types";
import sourcePropTypes from "../services/sourcePropTypes";

/**
 * DataTb component renders a data table with search functionality.
 *
 * @param {Object} props - Component props
 * @param {Object} props.source - The data source to fetch data from
 * @param {Array} props.columns - Array describing columns for the DataTable
 * @param {...Object} props - Additional props passed to DataTable
 */
const DataTb = ({ source, columns, ...props }) => {
  const [data, setData] = useState([]); // State to hold the fetched data
  const [isLoading, setIsLoading] = useState(false); // State to manage loading status
  const [error, setError] = useState(null); // State to hold any error that occurs during data fetching
  const [searchText, setSearchText] = useState(""); // State to hold the search input text

  /**
   * Fetches data from the specified source and updates the state.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true); // Set loading state to true
    try {
      const jsonData = await getDataFromSource(source); // Fetch data from the source
      setData(jsonData || []); // Update data state with fetched data or empty array
    } catch (err) {
      // Handle any errors that occur during data fetching
      setError({
        message: "Error getting data",
        stack: err,
      });
    } finally {
      setIsLoading(false); // Set loading state to false after fetching
    }
  }, [source]);

  // Effect to fetch data when the component mounts or when the source changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handles the search input change and updates the search text state.
   *
   * @param {Object} e - The event object
   */
  const handleSearch = useCallback((e) => {
    const searchTerm = e.target.value; // Get the value from the input
    setSearchText(searchTerm); // Update the search text state
  }, []);

  // Filter the data based on the search text
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Render loading or error states
  if (isLoading) {
    return <div>Loading...</div>; // Show loading message
  }

  if (error) {
    console.error(error); // Log the error to the console
    return <div className="text-error">Error: {error.message}</div>; // Show error message
  }

  return (
    <>
      <input
        type="text"
        className="form-control mb-5"
        value={searchText} // Bind the input value to the search text state
        placeholder="Search..."
        onChange={handleSearch} // Call handleSearch on input change
      />
      <DataTable data={filteredData} pagination columns={columns} {...props} /> {/* Render the DataTable with filtered data */}
    </>
  );
};

DataTb.propTypes = {
  /**
   * Object with information to source data
   */
  source: sourcePropTypes.isRequired,
  /**
   * Array describing colums: https://react-data-table-component.netlify.app/?path=/docs/api-columns--docs
   */
  columns: PropTypes.array.isRequired,
}

export { DataTb }
