import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import "./Login.css";

const Login = () => {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();

		const success = login(email, password);

		if (success) {
			navigate("/dashboard");
		} else {
			alert("Invalid Credentials");
		}
	};

	return (
		<div className="login-container">
			<form onSubmit={handleLogin}>
				<h2> Admin Login</h2>
				<input
					type="email"
					value={email}
					placeholder="Email"
					onChange={(e) => setEmail(e.target.value)}
				/>

				<input
					type="password"
					value={password}
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button type="submit">Login</button>
			</form>
		</div>
	);
};

export default Login;