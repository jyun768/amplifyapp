import React from 'react';
import './App.css';
import EC2List from './components/EC2List.tsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS EC2管理ダッシュボード</h1>
      </header>
      <main>
        <EC2List />
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} AWS EC2ダッシュボード</p>
      </footer>
    </div>
  );
}

export default App;
