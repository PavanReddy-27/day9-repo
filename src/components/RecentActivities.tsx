import "./RecentActivities.css";

const activities = [
  {
    id: 1,
    title: "New employee Pavan Reddy joined.",
    time: "2 mins ago",
  },
  {
    id: 2,
    title: "HR Department updated.",
    time: "15 mins ago",
  },
  {
    id: 3,
    title: "Monthly report generated.",
    time: "1 hour ago",
  },
  {
    id: 4,
    title: "New role created.",
    time: "3 hours ago",
  },
];

const RecentActivities = () => {
  return (
    <div className="activities-card">
      <h2>Recent Activities</h2>

      {activities.map((item) => (
        <div className="activity-item" key={item.id}>
          <div className="activity-icon">✔</div>

          <div className="activity-content">
            <h4>{item.title}</h4>
            <small>{item.time}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;