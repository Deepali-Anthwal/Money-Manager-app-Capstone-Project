# Capstone Project - Money Manager App

## Project Overview
This **Money Manager App** is a personal finance tool developed to help users track their daily income and expenses. Built using JavaScript, HTML, and CSS, this application provides a real-time summary of financial health through data persistence and a dynamic visual chart. 

## Implementation Details
* **Object-Oriented Programming (OOP):** Utilized a Transaction constructor function to create structured data objects for every entry, ensuring data consistency across the app.
* **Data Persistence:** Integrated localStorage using JSON.stringify and JSON.parse. This ensures user data remains intact even after browser refreshes or crashes.
* **Dynamic Data Visualization:** Implemented a custom Bar Chart from scratch. The chart uses dynamic scaling logic to calculate the highestValue of expenses, ensuring the UI remains proportional regardless of the transaction amounts.
* **Error Handling:** Implemented try...catch blocks to handle potential runtime exceptions during data retrieval and storage operations, providing a fail-safe user experience.
* **Form Validation:** Added real-time visual feedback using CSS and JS. Invalid amounts or future dates trigger red-border highlights and descriptive alerts.

## Challenges Faced
* **CSV Date Logic & Excel Compatibility:** A major challenge was that exported CSV files displayed dates as #### in Excel due to column width and format sensitivity. I resolved this by normalizing the date string to DD/MM/YYYY during the export process to ensure better software compatibility.
* **Asynchronous State Management:** Ensuring the Bar Chart and the Financial Summary (Income/Expense/Balance) updated simultaneously during deletions or edits was complex. I solved this by creating a centralized refreshTable() function that re-renders all UI components whenever the data array changes.
* **UI Empty States (Zero-Data Handling):** Initially, the chart appeared empty or broken when no records were present. I implemented a Zero State check that displays a friendly "No data to Plot" message within the chart area to guide the user, same as for when no records are added in transactions, "No records Found" message is displayed in the table area.
* **Data Integrity during Edits:** Handling the Edit mode required tracking the specific transaction ID while updating its properties. I implemented a currentlyEditing flag and a hidden input field to ensure the correct object was modified without losing its unique identifier.

## Key Learnings
* **DOM Manipulation & Event Handling:** Gained a deep understanding of how to dynamically update the UI and handle multiple event listeners (like radio button changes for categories) without slowing down performance.
* **Algorithmic Sorting & Filtering:** Learned how to use the .sort() and .filter() methods with custom comparator functions to allow users to toggle between Newest First, Oldest First, and Highest Amount.
* **UX/UI Feedback Loops:** I learned that user interface design is about communication. Implementing Confirm Delete prompts and visual validation taught me how to prevent user errors before they happen.
* **Separation of Concerns:** By structuring the project into separate HTML, CSS, and JS files, I learned the importance of modularity, making the code much easier to debug and prepare for Version Control.

## How to Run the Project
1. Download index.html, style.css and script.js files from this repository to your local machine.(make sure all files are in same folder)
2. Open index.html in any modern web browser.
3. You can now Track your Expenses and manage budget through this app!
