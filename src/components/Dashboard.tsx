const Dashboard = ({ authState }: { authState: any }) => <div>Test Dashboard: {authState.isAuthenticated ? "Connected" : "Not Connected"}</div>; export default Dashboard;
