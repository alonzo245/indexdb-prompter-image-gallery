import React, { useState, useEffect } from "react";

const TextareaForm = () => {
  const [inputValue, setInputValue] = useState("");
  const [storedData, setStoredData] = useState([]);

  // Load the stored data from localStorage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("textareaData");
    if (savedData) {
      setStoredData(JSON.parse(savedData));
    }
  }, []);

  // Handle the input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Save the array to localStorage
  const saveToLocalStorage = (data) => {
    localStorage.setItem("textareaData", JSON.stringify(data));
  };

  const handleClearItems = () => {
    localStorage.removeItem("textareaData");
    setStoredData([]);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Split the textarea value by empty lines (lines with only spaces or no content)
    const linesArray = inputValue
      .split("**")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    // Update the stored data and save to localStorage
    const updatedData = [...storedData, ...linesArray];
    setStoredData(updatedData);
    saveToLocalStorage(updatedData);

    // Clear the input after submission
    setInputValue("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          rows="3"
          cols="30"
          placeholder="Enter text, each line will be stored as an array item."
        />
        <br />
        <button type="submit">Save</button>
        <button
          onClick={handleClearItems}
          style={{ marginTop: "10px", backgroundColor: "red", color: "white" }}
        >
          Clear Items
        </button>
      </form>

      <h3>Stored Data</h3>
      {/* <ul>
        {storedData.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default TextareaForm;
