import ShortenUrlForm from './components/ShortenUrlForm';
import './styles/main.css';

const App: React.FC = () => {
  return (
    <div className="container">
      <header className="header">
        <h1>URL Shortener</h1>
        <p>Shorten your ugly long URLs</p>
      </header>
      
      <main>
        <ShortenUrlForm />
      </main>
    </div>
  );
};

export default App;
