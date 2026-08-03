import "./Departments.css";

const Departments = () => {
  const departments = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
  ];

  return (
    <div className="admin-departments-page">
      <div className="departments-header">
        <div>
          <h1>Departments</h1>
          <p>Manage the departments that shape your teams and reporting structure.</p>
        </div>
      </div>

      <div className="departments-card">
        <div className="departments-table-wrapper">
          <table className="departments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((department, index) => (
                <tr key={department}>
                  <td>{index + 1}</td>
                  <td>{department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Departments;