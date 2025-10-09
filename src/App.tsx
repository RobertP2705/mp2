import React from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  [key: string]: any; 
}


const ListView = () => {
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sortProperty, setSortProperty] = useState('strMeal');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchData = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.data.meals) {
        setAllMeals(response.data.meals);
        setFilteredMeals(response.data.meals);
      } else {
        setAllMeals([]);
        setFilteredMeals([]);
        setError('no meals found');
      }
    } catch (error) {
      setError('failed to fetch data');
      setAllMeals([]);
      setFilteredMeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMeals(allMeals);
      return;
    }
    const filtered = allMeals.filter(meal =>
      meal.strMeal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.strCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.strArea.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMeals(filtered);
  }, [searchTerm, allMeals]);

  useEffect(() => {
    const sorted = [...filteredMeals].sort((a, b) => {
      const aValue = a[sortProperty]?.toLowerCase() || '';
      const bValue = b[sortProperty]?.toLowerCase() || '';
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
    setFilteredMeals(sorted);
  }, [sortProperty, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchData(searchTerm);
    }
  };

  const handleSortChange = (property: string) => {
    if (sortProperty === property) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortProperty(property);
      setSortOrder('asc');
    }
  }; 

  return (
    <div style={{ padding: '20px' }}>
      <h2>list view</h2>
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="search meals"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'loading...' : 'search'}
        </button>
      </form>

      {filteredMeals.length > 0 && (
        <div>
          <h4>sort by:</h4>
          {['strMeal', 'strCategory', 'strArea'].map(property => (
            <button
              key={property}
              onClick={() => handleSortChange(property)}
            >
              {property === 'strMeal' ? 'name' : property === 'strCategory' ? 'category' : 'area'}
              {sortProperty === property && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <p>loading meals...</p>}

      {filteredMeals.length > 0 && (
        <div>
          <h3>results ({filteredMeals.length})</h3>
          {filteredMeals.map((meal) => (
            <Link key={meal.idMeal} to={`/detail/${meal.idMeal}`}>
              <div style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                <img src={meal.strMealThumb} alt={meal.strMeal} width="100" height="100" />
                <div>
                  <h4>{meal.strMeal}</h4>
                  <p>category: {meal.strCategory}</p>
                  <p>area: {meal.strArea}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const GalleryView = () => {
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const fetchAllMeals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const categoriesResponse = await axios.get('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
      const categories = categoriesResponse.data.meals?.map((cat: any) => cat.strCategory) || [];
      
      const allMealsData: Meal[] = [];
      for (const category of categories.slice(0, 10)) { 
        try {
          const response = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`
          );
          
          if (response.data.meals) {
            const mealDetails = await Promise.all(
              response.data.meals.slice(0, 5).map(async (meal: any) => {
                const detailResponse = await axios.get(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                return detailResponse.data.meals?.[0];
              })
            );
            
            const validMeals = mealDetails.filter(meal => meal !== undefined) as Meal[];
            allMealsData.push(...validMeals);
          }
        } catch (error) {
        }
      }
      
      setAllMeals(allMealsData);
      setFilteredMeals(allMealsData);
      setAvailableCategories(categories.slice(0, 10));
    } catch (error) {
      setError('failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMeals();
  }, []);

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredMeals(allMeals);
    } else {
      const filtered = allMeals.filter(meal =>
        selectedCategories.includes(meal.strCategory)
      );
      setFilteredMeals(filtered);
    }
  }, [selectedCategories, allMeals]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>gallery view</h2>
      
      <div>
        <button onClick={fetchAllMeals} disabled={loading}>
          {loading ? 'loading...' : 'load all meals'}
        </button>
      </div>

      {availableCategories.length > 0 && (
        <div>
          <h4>filter by category:</h4>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              style={{ backgroundColor: selectedCategories.includes(category) ? 'blue' : 'gray' }}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <p>loading meals...</p>}

      {filteredMeals.length > 0 && (
        <div>
          <h3>gallery ({filteredMeals.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {filteredMeals.map((meal) => (
              <Link key={meal.idMeal} to={`/detail/${meal.idMeal}`}>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <img src={meal.strMealThumb} alt={meal.strMeal} width="100%" height="150" />
                  <h4>{meal.strMeal}</h4>
                  <p>category: {meal.strCategory}</p>
                  <p>area: {meal.strArea}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealDetails = async (mealId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
      );
      
      if (response.data.meals && response.data.meals.length > 0) {
        setMeal(response.data.meals[0]);
      } else {
        setError('meal not found');
      }
    } catch (error) {
      setError('failed to fetch meal details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMealsForNavigation = async () => {
    try {
      const response = await axios.get(
        'https://www.themealdb.com/api/json/v1/1/search.php?s='
      );
      
      if (response.data.meals) {
        setAllMeals(response.data.meals);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (id) {
      fetchMealDetails(id);
      fetchAllMealsForNavigation();
    }
  }, [id]);

  useEffect(() => {
    if (meal && allMeals.length > 0) {
      const index = allMeals.findIndex(m => m.idMeal === meal.idMeal);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [meal, allMeals]);

  const goToPrevious = () => {
    if (allMeals.length > 0) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : allMeals.length - 1;
      setCurrentIndex(newIndex);
      navigate(`/detail/${allMeals[newIndex].idMeal}`);
    }
  };

  const goToNext = () => {
    if (allMeals.length > 0) {
      const newIndex = currentIndex < allMeals.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      navigate(`/detail/${allMeals[newIndex].idMeal}`);
    }
  };

  const getIngredients = (meal: Meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof Meal];
      const measure = meal[`strMeasure${i}` as keyof Meal];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ ingredient, measure: measure || '' });
      }
    }
    return ingredients;
  };

  if (loading) {
    return <div><p>loading meal details...</p></div>;
  }

  if (error || !meal) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error || 'meal not found'}</p>
        <button onClick={() => navigate('/')}>back to home</button>
      </div>
    );
  }

  const ingredients = getIngredients(meal);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')}>← back to home</button>
        <div>
          <button onClick={goToPrevious}>← previous</button>
          <button onClick={goToNext}>next →</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <img src={meal.strMealThumb} alt={meal.strMeal} width="300" />
        <div>
          <h1>{meal.strMeal}</h1>
          <p>category: {meal.strCategory}</p>
          <p>area: {meal.strArea}</p>
        </div>
      </div>

      {ingredients.length > 0 && (
        <div>
          <h2>ingredients</h2>
          <div>
            {ingredients.map((item, index) => (
              <div key={index} style={{ border: '1px solid #ccc', padding: '5px', margin: '5px' }}>
                <strong>{item.ingredient}</strong>
                {item.measure && <span> - {item.measure}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {meal.strInstructions && (
        <div>
          <h2>instructions</h2>
          <div style={{ border: '1px solid #ccc', padding: '10px' }}>
            {meal.strInstructions.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
function App() {
  return (
    <BrowserRouter basename="/mp2">
      <div>
        <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: '20px' }}>list view</Link>
          <Link to="/gallery">gallery view</Link>
        </nav>

        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/detail/:id" element={<DetailView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
