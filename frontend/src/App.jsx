import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from './pages/home/HomePage';
import LogInPage from "./pages/auth/LogInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {

  //ye kaam useEffect se bhi ho skta h .. ham yah logged in user ka data nikal rhe h ...taaki direct home page pr render krwa ske , user login nhi h ,usne log out kr diya h toh , login page pr redirect krwdo.
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"], // Unique key for caching
    queryFn: async () => {
      try {
        // Make a request to the backend to fetch the authenticated user
        const res = await fetch("https://twitter-clone-mern-backend.vercel.app/api/auth/me", {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          },
          credentials: "include", // ✅ Required to send cookies
        });
        const data = await res.json();

  
        // If server returns an error message, handle it
        if (data.error) return null;
  
        // If response is not OK, throw an error
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
  
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false, // Prevents automatic retries on failure
  });

  if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

  return (
    <div className='flex max-w-6xl mx-auto'>
    {authUser && <Sidebar />}
    <Routes>
      <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
      <Route path='/login' element={!authUser ? <LogInPage /> : <Navigate to='/' />} />
      <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
      <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
      <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
    </Routes>
    {authUser && <RightPanel />}
    <Toaster />
  </div>
  )
}

export default App
