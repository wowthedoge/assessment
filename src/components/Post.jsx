
function Post({ title, publishDate, name, avatar, summary, categories }) {
  let isoDate = new Date(publishDate);
  let options = { month: 'long' };
  let monthName = isoDate.toLocaleDateString('en-US', options);
  let formattedDate =
    isoDate.getDate() + ' ' + monthName + ' ' + isoDate.getFullYear();

  return (
    <div className="post">
      <h2>{title}</h2>
      <div className="sub-bar">
        <h4>{formattedDate}</h4>
        <div className='name-bar'>
        
        <h5>{name}</h5>
        <img src={avatar}></img>
        </div>
      </div>
      <p>{summary}</p>
      <ul className="category-bar">
        {categories.map((category) => (
          <li key={category.id} className="category">
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Post;
