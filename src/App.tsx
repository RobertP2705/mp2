import React from 'react';
import 'normalize.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios'; 
import { useState, useEffect } from 'react'; 

const Home = () => {
  const [data, setData] = useState<any>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios({
          url: 'https://api.quotable.io/random',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 
  }, []); 

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Home Page - Random Quote</h2>
      {data && <blockquote>"{data.content}" — {data.author}</blockquote>}
    </div>
  );
};

const About = () => <h2>About Page</h2>;


function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/">Home</Link> | <Link to="/about">About</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
