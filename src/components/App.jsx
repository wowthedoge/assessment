import { useState, useEffect, useRef } from 'react';
import Post from './Post';
import Select from 'react-select';

// I have just realized after finishing it that I could have used query search
// parameters and modified the backend to implement to filter much more simply
// My solution here is totally on the frontend

function App() {
  const [allPosts, setAllPosts] = useState([]);
  const searchedNameRef = useRef([]);
  const searchedBeforeDateRef = useRef([]);
  const searchedAfterDateRef = useRef([]);
  const searchedCategoriesRef = useRef([]);
  const [allCategories, setAllCategories] = useState([]);
  // displayedPosts depends on previous values, rerenders App
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [numPosts, setNumPosts] = useState(9);

  useEffect(() => {
    // simple fetch
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        setAllPosts(data.posts);
        setDisplayedPosts(data.posts);

        // make an array of categories in format usable by dropdown menu
        const allCategoriesSet = new Set();
        data.posts.forEach((post) =>
          post.categories.forEach((category) =>
            allCategoriesSet.add(category.name)
          )
        );
        let allCategoriesList = Array.from(allCategoriesSet);
        allCategoriesList = allCategoriesList.map((c, index) => ({
          value: index,
          label: c,
        }));
        setAllCategories(allCategoriesList);

        // initialize filters with all posts
        searchedNameRef.current = data.posts
        searchedBeforeDateRef.current = data.posts
        searchedAfterDateRef.current = data.posts
        searchedCategoriesRef.current = data.posts

      })

      
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // first I wanted to set display:none on filtered posts, but I think it was better
  // to just use another separate state than pass state down to the child, hence
  // having a displayedPosts state

  // I used refs instead of a state to store searchedName, searchedBeforeDate etc
  // Because I did not want it to rerender based on these changes
  // I wanted it to rerender based on an end displayedPosts array which is the result
  // of all the filters
  // Because I wanted to avoid stacking setStates (setName then setDisplayedPosts)
  // although setState(prevState => ...) might have worked but I wanted to avoid that
  // complexity

  // I like the feel of a simultaneous filter on criteria input rather than a 'filter' button
  // Originally I had a clunkier filter function
  // onNameInputChange -> filter(e.target.value, beforedateref, categoryref)...
  // function filter(name, beforeDate, afterDate, categories) {
  //  ... = allPosts.filter(name).filter(beforeDate)...
  //  setDisplayedPosts...
  // }
  // this looks much better

  function filterByName(name) {
    searchedNameRef.current = allPosts.filter((post) =>
      name.length === 0
        ? true
        : post.title.toLowerCase().startsWith(name.toLowerCase())
    );
    filter();
  }

  function filterByBeforeDate(beforeDate) {
    searchedBeforeDateRef.current = allPosts.filter((post) =>
      beforeDate.length === 0 ? true : post.publishDate < beforeDate
    );
    filter();
  }

  function filterByAfterDate(afterDate) {
    searchedAfterDateRef.current = allPosts.filter((post) =>
      afterDate.length === 0 ? true : post.publishDate > afterDate
    );
    filter();
  }

  function filterByCategories(categories) {
    const categoriesNames = categories.map((category) => category.label);
    searchedCategoriesRef.current = allPosts.filter((post) => {
      const postCategories = post.categories.map((category) => category.name);
      return categories.length === 0
        ? true
        : categoriesNames.every((searchedElement) =>
            postCategories.includes(searchedElement)
          );
    });
    filter();
  }

  function filter() {
    setDisplayedPosts(
      allPosts
      .filter(post => searchedNameRef.current.includes(post))
      .filter(post => searchedBeforeDateRef.current.includes(post))
      .filter(post => searchedAfterDateRef.current.includes(post))
      .filter(post => searchedCategoriesRef.current.includes(post))
    )
  }

  return (
    <div className="app">
      <div className="filter">
        <h1> Filter by: </h1>
        <div className="filter-bar">
          <input
            className="name"
            type="text"
            placeholder="Name"
            onChange={(e) => filterByName(e.target.value)}
          ></input>

          <div className="dates">
            <div id="input-beforedate">
              <label>Before:</label>
              <input
                type="date"
                onChange={(e) => filterByBeforeDate(e.target.value)}
              ></input>
            </div>
            <div id="input-afterdate">
              <label>After:</label>
              <input
                type="date"
                onChange={(e) => filterByAfterDate(e.target.value)}
              ></input>
            </div>
          </div>
          <div className="categories">
            <Select
              isMulti
              options={allCategories}
              className="basic-multi-select"
              placeholder="Category"
              onChange={(selected) => filterByCategories(selected)}
            ></Select>
          </div>
        </div>
      </div>
      <div className="posts-area">
        {displayedPosts.slice(0, numPosts).map((post) => (
          <Post
            key={post.id}
            title={post.title}
            publishDate={post.publishDate}
            name={post.author.name}
            avatar={post.author.avatar}
            summary={post.summary}
            categories={post.categories}
          />
        ))}
      </div>
      <div className="loadmore">
        <p>
          showing {Math.min(numPosts, displayedPosts.length) + ' '} of{' '}
          {' ' + displayedPosts.length}
        </p>
        {numPosts < displayedPosts.length && (
          <button onClick={() => setNumPosts(numPosts + 9)}>
            {' '}
            load more...{' '}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
