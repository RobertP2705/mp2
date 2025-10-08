import React from 'react';
import 'normalize.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios'; 
import { useState, useEffect } from 'react'; 

const Home = () => {
  const [data, setData] = useState<any>(null); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('Arrabiata');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        url: `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setData(response.data);
      
      if (!response.data.meals || response.data.meals.length === 0) {
        setError('No meals found for your search');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchTerm);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchTerm);
  }; 

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Meal Search</h2>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search for meals"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'searching...' : 'search'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ff9999', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {loading && <p>Loading meals...</p>}

      {data && data.meals && (
        <div>
          <h3>Search Results ({data.meals.length} meal{data.meals.length !== 1 ? 's' : ''} found)</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            {data.meals.map((meal: any, index: number) => (
              <div
                key={meal.idMeal}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', gap: '15px' }}>
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {meal.strMeal}
                    </h4>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Category:</strong> {meal.strCategory}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Area:</strong> {meal.strArea}
                    </p>
                    {meal.strInstructions && (
                      <p style={{ margin: '10px 0 0 0', color: '#555', fontSize: '14px' }}>
                        {meal.strInstructions.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
