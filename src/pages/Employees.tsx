const Employees = () => {
    return (
      <div className="dashboard-section">
        <h2>Employees</h2>
        <p>Employee management page.</p>
      </div>
    );
  };
  
  export default Employees;
const employees = [
  {
    id: 1,
    name: "John Smith",
    department: "Engineering",
    location: "New York",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    department: "Human Resources",
    location: "Chicago",
    status: "Active",
  },
  {
    id: 3,
    name: "Michael Brown",
    department: "Finance",
    location: "Boston",
    status: "On Leave",
  },
  {
    id: 4,
    name: "Emily Davis",
    department: "Marketing",
    location: "Austin",
    status: "Active",
  },
];

function Employees() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Employees</h1>

          <p>
            Manage and view employee
            information.
          </p>
        </div>
      </div>

      <div className="analytics-card">
        <h2>Employee Directory</h2>

        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {employees.map(
                (employee) => (
                  <tr key={employee.id}>
                    <td>
                      {employee.name}
                    </td>

                    <td>
                      {employee.department}
                    </td>

                    <td>
                      {employee.location}
                    </td>

                    <td>
                      <span
                        className={
                          employee.status ===
                          "Active"
                            ? "status-active"
                            : "status-leave"
                        }
                      >
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Employees;
