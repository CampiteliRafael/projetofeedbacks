// src/App.tsx
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import FeedbackForm from './components/common/FeedbackForm.tsx/FeedbackForm'; // Ajuste caminhos se necessário
import FeedbackList from './components/common/FeedbackList/FeedbackList'; // Ajuste caminhos se necessário
import Login from './pages/Login/Login';                   // Ajuste caminhos se necessário
import Register from './pages/Register';             // Ajuste caminhos se necessário
import ProtectedRoute from './components/ProtectedRoute'; // Ajuste caminhos se necessário
// import Header from './components/layout/Header'; // Exemplo de Header (você precisaria criar)
// import Footer from './components/layout/Footer'; // Exemplo de Footer (você precisaria criar)
import styles from './App.module.css'; // 1. Importa o CSS Module do App
import Header from './components/header/Header';

function App() {
  const [refresh, setRefresh] = useState(0);
  const handleSent = () => setRefresh((r) => r + 1);

  return (
    // 2. Aplica a classe do container geral
    <div className={styles.appContainer}>
      {/* <Header /> */} {/* Renderiza o Header aqui, se tiver */}
      <Header />
      {/* 3. Define uma área principal para o conteúdo da rota */}
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRole="user">
                {/* O conteúdo específico da rota será estilizado
                    pelo seu próprio componente/página e seu CSS Module */}
                <div>
                  <FeedbackForm onSent={handleSent} />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbacks"
            element={
              <ProtectedRoute requiredRole="adm">
                <FeedbackList refreshTrigger={refresh} />
              </ProtectedRoute>
            }
          />
          {/* <Route path="*" element={<div>Página Não Encontrada</div>} /> */}
        </Routes>
      </main>

      {/* <Footer /> */} {/* Renderiza o Footer aqui, se tiver */}
    </div>
  );
}

export default App;