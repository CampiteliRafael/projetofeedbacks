// src/App.tsx
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import styles from './App.module.css';
import Header from './components/header/Header'; // Ajuste o caminho
// --- Imports das Páginas e Componentes ---
import Login from './pages/Login/Login';                     // Ajuste o caminho
import Register from './pages/Register/Register';               // Ajuste o caminho
import FeedbackForm from './components/FeedbackForm.tsx/FeedbackForm';    // Ajuste o caminho
import FeedbackList from './components/FeedbackList/FeedbackList';    // Ajuste o caminho
import MyFeedbacks from './components/MyFeedbacks/MyFeedbacks';           // Ajuste o caminho
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'; // Ajuste o caminho
import RedirectIfLoggedIn from './components/common/RedirectIfLoggedIn/RedirectIfLoggedIn'; // <-- 1. Importe o novo wrapper

function App() {
  const [refresh, setRefresh] = useState(0);
  const handleSent = () => setRefresh((r) => r + 1);

  return (
    <div className={styles.appContainer}>
      <Header />
      <main className={styles.mainContent}>
        <Routes>
          {/* --- Rotas Públicas (Login / Registro) --- */}
          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <Login />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfLoggedIn>
                <Register />
              </RedirectIfLoggedIn>
            }
          />

          <Route
            path="/" // Formulário de criação
            element={
              <ProtectedRoute requiredRole="user">
                <div> <FeedbackForm onSent={handleSent}/> </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-feedbacks" // Lista do usuário
            element={
              <ProtectedRoute requiredRole='user'>
                <MyFeedbacks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbacks" // Painel do Admin
            element={
              <ProtectedRoute requiredRole="adm">
                <FeedbackList refreshTrigger={refresh}/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default App;