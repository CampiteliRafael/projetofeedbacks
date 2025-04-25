import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  const [refresh, setRefresh] = useState(0);

  const handleSent = () => setRefresh((r) => r + 1);

    return (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute requiredRole="user">
                                <div>
                                    <FeedbackForm  onSent={handleSent}/>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/feedbacks"
                        element={
                            <ProtectedRoute requiredRole="adm">
                                <FeedbackList refreshTrigger={refresh}/>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
    );
}

export default App;
