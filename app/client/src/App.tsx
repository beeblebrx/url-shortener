import React from 'react';
import UrlList from './components/UrlList';
import './styles/main.css';

const App: React.FC = () => {
  return (
    <div className="container">
      <header className="header">
        <h1>URL Shortener</h1>
        <p>View and manage all shortened URLs</p>
      </header>
      
      <main>
        <UrlList />
      </main>
    </div>
  );
};

export default App;
