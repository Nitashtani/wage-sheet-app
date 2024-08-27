import React, { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";

function App() {
  const [name, setName] = useState("");
  const [grossPay, setGrossPay] = useState("");
  const [days, setDays] = useState("");
  const [advance, setAdvance] = useState("");
  const [employees, setEmployees] = useState([]);

  const calculateWages = (e) => {
    e.preventDefault();

    const gross = parseFloat(grossPay);
    const daysWorked = parseFloat(days);
    const advanceAmount = parseFloat(advance);

    // Calculate Payable
    const payable = Math.round((gross / 30) * daysWorked);

    // Calculate EPF (capped at 1800 unless name is HARKANWAL or gross <= 35000)
    const epfRate = 0.12;
    let epf = 0;
    if (gross <= 35000 || name === "HARKANWAL") {
      epf = payable * epfRate;
      epf = Math.max(Math.round(epf), 1800);
    }

    // Calculate ESI (0.75% of Payable, rounded to integer, but 0 if Gross Pay > 35000)
    let esi = 0;
    if (gross <= 35000) {
      const esiRate = 0.0075;
      esi = Math.round(payable * esiRate);
    }

    // Fixed Welfare amount
    const welfare = 5;

    // Calculate Net Payable
    const netPay = payable - epf - esi - welfare - advanceAmount;

    const employee = {
      name,
      grossPay: `₹${gross.toFixed(2)}`,
      days: daysWorked.toFixed(2),
      payable: `₹${payable.toFixed(2)}`,
      epf: `₹${epf.toFixed(2)}`,
      esi: `₹${esi.toFixed(2)}`,
      welfare: `₹${welfare.toFixed(2)}`,
      advance: `₹${advanceAmount.toFixed(2)}`,
      netPay: `₹${netPay.toFixed(2)}`,
    };

    setEmployees([...employees, employee]);

    // Clear the form
    setName("");
    setGrossPay("");
    setDays("");
    setAdvance("");
  };

  const handleClear = () => {
    setEmployees([]);
  };

  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(employees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Wage Sheet");
    XLSX.writeFile(wb, "wage_sheet.xlsx");
  };

  const handlePrint = () => {
    const printContent = document.getElementById("wage-table").outerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
      <head>
        <title>Print Wage Sheet</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h1>Wage Sheet</h1>
        ${printContent}
        <script>
          window.print();
          window.onafterprint = function() {
            window.location.reload();
          };
        </script>
      </body>
      </html>
    `;
  };

  return (
    <div className="App">
      <h1>Wage Sheet</h1>

      {/* Background text */}
      <div className="background-text">CONFIDENTIAL</div>

      <form onSubmit={calculateWages}>
        <label>
          Employee Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Gross Pay (₹):
          <input
            type="number"
            value={grossPay}
            onChange={(e) => setGrossPay(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Number of Days:
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Advance (₹):
          <input
            type="number"
            value={advance}
            onChange={(e) => setAdvance(e.target.value)}
          />
        </label>
        <br />
        <button type="submit" className="button">
          Calculate Wages
        </button>
      </form>

      <h2>Wage Sheet</h2>
      <div id="wage-table" className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Gross Pay</th>
              <th>Number of Days</th>
              <th>Payable</th>
              <th>EPF</th>
              <th>ESI</th>
              <th>Welfare</th>
              <th>Advance</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.name}</td>
                  <td>{employee.grossPay}</td>
                  <td>{employee.days}</td>
                  <td>{employee.payable}</td>
                  <td>{employee.epf}</td>
                  <td>{employee.esi}</td>
                  <td>{employee.welfare}</td>
                  <td>{employee.advance}</td>
                  <td>{employee.netPay}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No records available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleClear} className="button">
          Clear Records
        </button>
        <button
          onClick={handleExportToExcel}
          className="button"
          style={{ marginLeft: "10px" }}
        >
          Export to Excel
        </button>
        <button
          onClick={handlePrint}
          className="button"
          style={{ marginLeft: "10px" }}
        >
          Print Table
        </button>
      </div>
    </div>
  );
}

export default App;
