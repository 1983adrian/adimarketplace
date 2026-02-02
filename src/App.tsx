import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>MarketPlace România este online!</h1>
            <p>Configurația de bază a fost restaurată.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
